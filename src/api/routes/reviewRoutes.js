const express = require('express');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
	.route('/')
	.get(reviewController.getAllReviews)
	.post(
		authController.restrictAccessTo('user'),
		reviewController.setUserTourIds,
		reviewController.createReview
	);

router
	.route('/:id')
	.get(reviewController.getReview)
	.patch(
		authController.restrictAccessTo('user', 'admin'),
		reviewController.updateReview
	)
	.delete(reviewController.deleteReview);

module.exports = router;
