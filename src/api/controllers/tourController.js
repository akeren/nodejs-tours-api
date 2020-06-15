const Tour = require('./../models/tourModel');
const APIFeatures = require('./../../utils/apiFeatures');
const catchAsyncErrors = require('./../../utils/catchAsyncError');
const AppError = require('./../../utils/appError');

exports.aliasTopTours = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

exports.getAllTours = catchAsyncErrors(async (req, res, next) => {
	// EXECUTE QUERY
	const features = new APIFeatures(Tour.find(), req.query)
		.filter()
		.sort()
		.limitFields()
		.paginate();

	const tours = await features.query;

	// SEND RESPONSE
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours
		}
	});
});

exports.getTour = catchAsyncErrors(async (req, res, next) => {
	const tour = await Tour.findById(req.params.id);

	if (!tour) {
		return next(new AppError('No tour found with that ID', 404));
	}

	res.status(200).json({
		status: 'success',
		data: {
			tour
		}
	});
});

exports.createTour = catchAsyncErrors(async (req, res, next) => {
	const tour = await Tour.create(req.body);

	res.status(201).json({
		status: 'success',
		data: {
			tour
		}
	});
});

exports.updateTour = catchAsyncErrors(async (req, res, next) => {
	const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});

	if (!tour) {
		return next(new AppError('No tour found with that ID', 404));
	}

	res.status(200).json({
		status: 'success',
		data: {
			tour
		}
	});
});

exports.deleteTour = catchAsyncErrors(async (req, res, next) => {
	const tour = await Tour.findByIdAndDelete(req.params.id);

	if (!tour) {
		return next(new AppError('No tour found with that ID', 404));
	}

	res.status(204).json({
		status: 'success',
		data: null
	});
});

exports.getTourStats = catchAsyncErrors(async (req, res, next) => {
	const stats = await Tour.aggregate([
		{
			$match: { ratingsAverage: { $gte: 4.5 } }
		},
		{
			$group: {
				_id: { $toUpper: '$difficulty' },
				numTours: { $sum: 1 },
				numRatings: { $sum: '$ratingsQuantity' },
				avgRatings: { $avg: '$ratingsAverage' },
				avgPrice: { $avg: '$price' },
				minPrice: { $min: '$price' },
				maxPrice: { $max: '$price' }
			}
		},
		{
			$sort: { avgPrice: 1 }
		}
	]);

	res.status(200).json({
		status: 'success',
		data: {
			stats
		}
	});
});

exports.getMonthlyPlan = catchAsyncErrors(async (req, res, next) => {
	const year = req.params.year * 1;

	const plan = await Tour.aggregate([
		{
			$unwind: '$startDates' // Destruct the array of Dates
		},
		{
			$match: {
				startDates: {
					$gte: new Date(`${year}-01-01`),
					$lte: new Date(`${year}-12-31`)
				}
			}
		},
		{
			$group: {
				_id: { $month: '$startDates' },
				numTourStarts: { $sum: 1 },
				tours: { $push: '$name' }
			}
		},
		{
			$addFields: { month: '$_id' }
		},
		{
			$project: { _id: 0 } // Remove id on a fly
		},
		{
			$sort: { numTourStarts: -1 }
		},
		{
			$limit: 12
		}
	]);

	res.status(200).json({
		status: 'success',
		result: plan.length,
		data: {
			plan
		}
	});
});
