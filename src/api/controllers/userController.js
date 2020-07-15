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

exports.getAllUsers = catchAsyncErrors(async (req, res) => {
	const users = await User.find({});

	res.status(200).json({
		status: 'status',
		result: users.length,
		data: {
			users
		}
	});
});

exports.updateMe = catchAsyncErrors(async (req, res, next) => {
	const { name, email, password, confirmPassword } = req.body;
	if (password || confirmPassword) {
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

exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
