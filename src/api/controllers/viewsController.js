const Tour = require('./../models/tourModel');
const catchAsyncErrors = require('./../../utils/catchAsyncError');

exports.getOverview = catchAsyncErrors(async (req, res) => {
	const tours = await Tour.find({});

	res.status(200).render('overview', {
		title: 'All tours',
		tours
	});
});

exports.getTour = catchAsyncErrors(async (req, res) => {
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'rating review user'
	});

	res.status(200).render('tour', {
		title: tour.name,
		tour
	});
});
