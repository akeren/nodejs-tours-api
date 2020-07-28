const Tour = require('./../models/tourModel');
const catchAsyncErrors = require('./../../utils/catchAsyncError');
// 20bf6b
// 76c9ce
exports.getOverview = catchAsyncErrors(async (req, res) => {
	const tours = await Tour.find({});

	res.status(200).render('overview', {
		title: 'All tours',
		tours
	});
});

exports.getTour = (req, res) => {
	res.status(200).render('tour', {
		title: 'The Forest Hiker!'
	});
};
