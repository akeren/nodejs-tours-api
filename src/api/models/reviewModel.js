const { Schema, model } = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new Schema({
	review: {
		type: String,
		required: [true, 'Review can not be empty.']
	},
	rating: {
		type: Number,
		min: 1,
		max: 5
	},
	createdAt: {
		type: Date,
		default: Date.now()
	},
	tour: {
		type: Schema.ObjectId,
		ref: 'Tour',
		required: 'Review must belong to a tour.'
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User',
		required: 'Review must belong to a user.'
	}
});

reviewSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name photo'
	});

	next();
});

/*
 ** Average and Quantity statistics for tour reviews
 */
reviewSchema.statics.calcAverageRating = async function (tourId) {
	const stats = await this.aggregate([
		{
			$match: { tour: tourId }
		},
		{
			$group: {
				_id: '$tour',
				nRating: { $sum: 1 },
				avgRating: { $avg: '$rating' }
			}
		}
	]);

	// Save the statistics to tours
	await Tour.findByIdAndUpdate(tourId, {
		ratingsAverage: stats[0].avgRating,
		ratingsQuantity: stats[0].nRating
	});
};

reviewSchema.post('save', function () {
	this.constructor.calcAverageRating(this.tour);
});

module.exports = model('Review', reviewSchema);
