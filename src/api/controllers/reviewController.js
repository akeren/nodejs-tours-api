const Review = require('./../models/reviewModel');
const AppError = require('./../../utils/appError');
const catchAsyncErrors = require('./../../utils/catchAsyncError');

exports.getAllReviews = catchAsyncErrors(async (req, res, next) => {
	const reviews = await Review.find();
	if (!reviews) {
		return new AppError('Review collection is empty.', 404);
	}

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
	const { review, rating, tour, user } = req.body;
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
