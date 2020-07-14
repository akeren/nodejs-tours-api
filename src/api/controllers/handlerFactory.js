const catchAsyncErrors = require('./../../utils/catchAsyncError');
const AppError = require('./../../utils/appError');
const { Model } = require('mongoose');

exports.deleteOne = (Model) =>
	catchAsyncErrors(async (req, res, next) => {
		const doc = await Model.findByIdAndDelete(req.params.id);

		if (!doc) {
			return next(new AppError('No Document found with that ID', 404));
		}

		res.status(204).json({
			status: 'success',
			data: null
		});
	});

exports.updateOne = (Model) =>
	catchAsyncErrors(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});

		if (!doc) {
			return next(new AppError('No Document found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});
