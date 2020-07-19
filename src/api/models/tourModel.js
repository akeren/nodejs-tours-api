const { Schema, model } = require('mongoose');
const validator = require('validator');
const slugify = require('slugify');

const tourSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'A tour must have a name'],
			unique: true,
			trim: true
		},
		slug: String,
		duration: {
			type: Number,
			required: [true, 'A tour must have a duration']
		},
		maxGroupSize: {
			type: Number,
			required: [true, 'A tour must have a group size']
		},
		difficulty: {
			type: String,
			required: [true, 'A tour must have a difficulty'],
			enum: {
				values: ['easy', 'medium', 'difficult'],
				message: 'Difficulty is either: Medium, Easy, Difficult'
			}
		},
		ratingsAverage: {
			type: Number,
			default: 4.5,
			min: [1, 'Ratings must be above 1.0'],
			max: [5, 'Ratings must be below 5.0'],
			set: (val) => Math.round(val * 10) / 10
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		price: {
			type: Number,
			required: [true, 'A tour must have a price']
		},
		priceDiscount: {
			type: Number,
			validate: {
				validator(val) {
					// THIS ONLY POINTS TO CURRENT DOC
					return val < this.price;
				},
				message: `Price Discount ({VALUE}) should be below regular price`
			}
		},
		summary: {
			type: String,
			trim: true,
			required: [true, 'A tour must have a summary']
		},
		description: {
			type: String,
			trim: true
		},
		imageCover: {
			type: String,
			required: [true, 'A tour must have a cover image']
		},
		images: [String],
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false
		},
		startDates: [Date],
		secretTour: {
			type: Boolean,
			default: false
		},
		startLocation: {
			type: {
				type: String,
				enum: ['Point'],
				default: 'Point'
			},
			coordinates: [Number],
			address: String,
			description: String
		},
		locations: [
			{
				type: {
					type: String,
					enum: ['Point'],
					default: 'Point'
				},
				coordinates: [Number],
				address: String,
				description: String,
				day: String
			}
		],
		guides: [
			{
				type: Schema.ObjectId,
				ref: 'User'
			}
		]
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

// create indexes
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

// VIRTUAL PROPERTY
tourSchema.virtual('durationWeeks').get(function () {
	return this.duration / 7;
});

// VIRTUAL POPULATE
tourSchema.virtual('reviews', {
	ref: 'Review',
	foreignField: 'tour',
	localField: '_id'
});

// DOCUMENT MIDDLEWARE: runs only for .save() & .create() mongoose methods
tourSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
	this.find({ secretTour: { $ne: true } });

	this.startTime = Date.now();
	next();
});

// POPULATE TOUR GUIDES
tourSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'guides',
		select: '-__v -passwordChangedAt'
	});

	next();
});

/* // AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
	this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
	next();
}); */

module.exports = model('Tour', tourSchema);
