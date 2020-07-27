const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

/*
 ** Nested routes with express on tour for reviews
 */
router.use('/:tourId/reviews', reviewRouter);

router
	.route('/top-5-cheap')
	.get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
	.route('/monthly-plan/:year')
	.get(
		authController.protect,
		authController.restrictAccessTo('admin', 'lead-guide', 'guide'),
		tourController.getMonthlyPlan
	);

// /tours-within/256/center/34,-58/unit/mi
router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

router
	.route('/')
	.get(tourController.getAllTours)
	.post(
		authController.protect,
		authController.restrictAccessTo('admin', 'lead-guide'),
		tourController.createTour
	);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(
		authController.protect,
		authController.restrictAccessTo('admin', 'lead-guide'),
		tourController.updateTour
	)
	.delete(
		authController.protect,
		authController.restrictAccessTo('admin', 'lead-guide'),
		tourController.deleteTour
	);

module.exports = router;
