const Review = require('./../models/reviewModel');
const AppError = require('./../../utils/appError');
const catchAsyncErrors = require('./../../utils/catchAsyncError');
const factory = require('./handlerFactory');

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

exports.getReview = catchAsyncErrors(async (req, res, next) => {
	const review = await Review.findById(req.params.id);

	if (!review) {
		return new AppError('No review found with that ID', 400);
	}

	res.status(200).json({
		status: 'success',
		data: {
			review
		}
	});
});

exports.createReview = catchAsyncErrors(async (req, res, next) => {
	let { review, rating, tour, user } = req.body;

	// Allow nested routes
	if (!tour) tour = req.params.tourId;
	if (!user) user = req.user.id;

	const newReview = await Review.create({
		review,
		rating,
		tour,
		user
	});

	if (!newReview) {
		return new AppError('Unable to create review. Try again!', 400);
	}

	res.status(201).json({
		status: 'success',
		data: {
			review: newReview
		}
	});
});

exports.deleteReview = factory.deleteOne(Review);
