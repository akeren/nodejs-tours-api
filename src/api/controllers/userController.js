const User = require('./../models/userModel');
const catchAsyncErrors = require('./../../utils/catchAsyncError');
const AppError = require('./../../utils/appError');
const factory = require('./handlerFactory');

const filterRquestBodyObject = (obj, ...allowedFields) => {
	const newObject = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) {
			newObject[el] = obj[el];
		}
	});
	return newObject;
};

exports.getMe = (req, res, next) => {
	req.params.id = req.user.id;
	next();
};

exports.updateMe = catchAsyncErrors(async (req, res, next) => {
	if (req.body.password || req.body.confirmPassword) {
		return next(
			new AppError(
				'This route is not to update password. Please use /updateMyPassword'
			)
		);
	}

	const filteredFields = filterRquestBodyObject(req.body, 'name', 'email');
	const user = await User.findByIdAndUpdate(req.user.id, filteredFields, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		status: 'success',
		data: {
			user
		}
	});
});

exports.deleteMe = catchAsyncErrors(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null
	});
});

exports.createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is yet to be defined! /signup instead'
	});
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
