const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsyncErrors = require('./../../utils/catchAsyncError');
const AppError = require('./../../utils/appError');
const sendEmail = require('./../../utils/email');

// CREATE USER'S AUTH TOKEN
const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
	});
};

const sendCreatedToken = (user, statusCode, res) => {
	const token = signToken(user._id);

	// SEND TOKEN VIA COOKIE
	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	res.cookie('jwt', token, cookieOptions);

	res.status(statusCode).json({
		status: 'success',
		data: {
			user
		},
		token
	});
};

const sendSuccessMessage = (message, statusCode, res) => {
	res.status(statusCode).json({
		status: 'success',
		message
	});
};

exports.signUp = catchAsyncErrors(async (req, res, next) => {
	const user = await User.create({
		name: req.body.name,
		email: req.body.email,
		role: req.body.role,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		passwordChangedAt: req.body.passwordChangedAt
	});

	// SEND TOKEN TO USER
	sendCreatedToken(user, 201, res);
});

exports.login = catchAsyncErrors(async (req, res, next) => {
	const { email, password } = req.body;

	// CHECK IF EMAIL AND PASSWORD ARE PROVIDED BY THE USER
	if (!email || !password) {
		return next(new AppError('Please provide email and password!', 400));
	}

	// SELECT THE USER WITH EMAIL PROVIDED
	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.checkPasswordValidity(password, user.password))) {
		return next(new AppError('Invalid Login Credentials!', 401));
	}

	// SEND TOKEN TO USER
	sendCreatedToken(user, 200, res);
});

exports.protect = catchAsyncErrors(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(
			new AppError('You are not logged in! Please login to get access.', 401)
		);
	}

	// VERIFICATION OF TOKEN
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// CHECK IF USER STILL EXISTS IN THE DB
	const decodedUser = await User.findById(decoded.id);
	if (!decodedUser) {
		return next(
			new AppError(
				`The user belogging to this token does no longer exist.`,
				401
			)
		);
	}

	// CHECK IF THE USER CHANGED PASSWORD AFTER THE TOKEN WAS ISSUED
	if (decodedUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError('You recently changed password! Please log in again.', 401)
		);
	}

	// GRANT ACCESS TO PROTECTED ROUTES
	req.user = decodedUser;
	next();
});

exports.restrictAccessTo = (...role) => {
	return (req, res, next) => {
		if (!role.includes(req.user.role)) {
			return next(
				new AppError('You do not have permission to perform this action.', 403)
			);
		}

		next();
	};
};

exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
	// GET THE USER WITH THE REGISTERED EMAIL
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(
			new AppError(
				'There is no user associated with the email address provided.',
				404
			)
		);
	}

	// GENERATE THE RESET TOKEN
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// SEND THE TOKEN TO USER'S EMAIL
	const resetURL = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/users/resetPassword/${resetToken}`;

	const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to: ${resetURL}. If you didn't forget your password, please ignore this email!`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (valid for 10 minutes)',
			message
		});
		sendSuccessMessage('Token sent to your email!', 200, res);
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return new AppError(
			'There was a error sending the email. Try again later!',
			500
		);
	}
});

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
	const { password, confirmPassword } = req.body;

	// HASH THE INCOMING TOKEN FROM THE USER'S EMAIL
	const incomingHashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	// GRAB THE USER USING THE HASHED TOKEN AND CHECK IF THE TOKEN HAS EXPIRED
	const user = await User.findOne({
		passwordResetToken: incomingHashedToken,
		passwordResetExpires: { $gt: Date.now() }
	});

	// CHECK IF NOT A USER
	if (!user) {
		return next(new AppError('Token is invalid or has expired!', 400));
	}

	user.password = password;
	user.confirmPassword = confirmPassword;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	// SEND THE TOKEN TO THE USER
	sendCreatedToken(user, 200, res);
});

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
	const { currentPassword, password, confirmPassword } = req.body;

	// GRAB USER FROM COLLECTION
	const user = await User.findById(req.user.id).select('+password');

	if (!(await user.checkPasswordValidity(currentPassword, user.password))) {
		return next(new AppError('Your current password is wrong', 401));
	}

	user.password = password;
	user.confirmPassword = confirmPassword;
	await user.save();

	// LOG USER IN, SEND JWT
	sendCreatedToken(user, 200, res);
});
