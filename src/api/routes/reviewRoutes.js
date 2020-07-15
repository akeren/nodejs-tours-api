const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.protect,
		authController.restrictAccessTo('user'),
		reviewController.setUserTourIds,
		reviewController.createReview
	);

router
	.route('/:id')
	.patch(reviewController.updateReview)
	.delete(reviewController.deleteReview);

module.exports = router;
