const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsyncErrors = require('./../../utils/catchAsyncError');
const AppError = require('./../../utils/appError');

// CREATE USER'S AUTH TOKEN
const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN
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

	const token = signToken(user._id);

	res.status(201).json({
		status: 'success',
		data: {
			user
		},
		token
	});
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

	const token = signToken(user._id);

	res.status(200).json({
		status: 'success',
		token
	});
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
});

exports.resetPassword = (req, res, next) => {};
