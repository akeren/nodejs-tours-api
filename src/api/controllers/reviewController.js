const Review = require('./../models/reviewModel');
const AppError = require('./../../utils/appError');
const catchAsyncErrors = require('./../../utils/catchAsyncError');
const factory = require('./handlerFactory');

exports.setUserTourIds = (req, res, next) => {
	// Allow nested routes
	if (!req.body.tour) req.body.tour = req.params.tourId;
	if (!req.body.user) req.body.user = req.user.id;
	next();
};

exports.getAllReviews = catchAsyncErrors(async (req, res, next) => {
	let filter = {};
	if (req.params.tourId) filter = { tour: req.params.tourId };

	const reviews = await Review.find(filter);

	res.status(200).json({
		status: 'success',
		result: reviews.length,
		data: {
			reviews
		}
	});
});

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
