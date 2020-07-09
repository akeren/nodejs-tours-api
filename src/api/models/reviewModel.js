const { Schema, model } = require('mongoose');

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

module.exports = model('Review', reviewSchema);
