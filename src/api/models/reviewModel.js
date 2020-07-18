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

/*
 ** Prevent duplicate reviews on a given tour by same user
 ** Using indexes
 */
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

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

	if (stats.length > 0) {
		// Save the statistics to tours
		await Tour.findByIdAndUpdate(tourId, {
			ratingsAverage: stats[0].avgRating,
			ratingsQuantity: stats[0].nRating
		});
	} else {
		// Reset to default
		await Tour.findByIdAndUpdate(tourId, {
			ratingsAverage: 4.5,
			ratingsQuantity: 0
		});
	}
};

reviewSchema.post('save', function () {
	// this points to the current review object
	this.constructor.calcAverageRating(this.tour);
});

/*
 ** Grab the current review Object
 ** And pass it to the next middleware
 */
reviewSchema.pre(/^findOneAnd/, async function (next) {
	this.r = await this.findOne();
	next();
});

/*
 ** awiat this.findOne(); does not here
 ** Because query has already executed
 */
reviewSchema.post(/^findOneAnd/, async function () {
	await this.r.constructor.calcAverageRating(this.r.tour);
});

module.exports = model('Review', reviewSchema);
