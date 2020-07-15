const catchAsyncErrors = require('./../../utils/catchAsyncError');
const AppError = require('./../../utils/appError');

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

exports.createOne = (Model) =>
	catchAsyncErrors(async (req, res, next) => {
		const doc = await Model.create(req.body);

		if (!doc) {
			return next(new AppError('Unable to create document. Try again!', 400));
		}

		res.status(201).json({
			status: 'success',
			data: {
				data: doc
			}
		});
	});

exports.getOne = (Model, populateOption) =>
	catchAsyncErrors(async (req, res, next) => {
		let query = Model.findById(req.params.id);

		if (populateOption) {
			query = query.populate(populateOption);
		}

		const doc = await query;

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
