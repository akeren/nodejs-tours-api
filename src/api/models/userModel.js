const crypto = require('crypto');
const { Schema, model } = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchmea = new Schema({
	name: {
		type: String,
		trim: true,
		required: [true, 'Please tell us your name!']
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		unique: true,
		required: [true, 'Please provide your email address'],
		validate: [validator.isEmail, 'Please enter a valid email address']
	},
	photo: String,
	role: {
		type: String,
		lowercase: true,
		enum: ['user', 'admin', 'guide', 'lead-guide'],
		default: 'user'
	},
	password: {
		type: String,
		required: [true, 'Please provide your password'],
		minlength: [8, 'Password must be minimum of eight (8) charcters'],
		validate(value) {
			if (value.toLowerCase().includes('password')) {
				throw new Error('Password can not contain "password"');
			}
		},
		select: false
	},
	confirmPassword: {
		type: String,
		required: [true, 'Please confirm your password'],
		validate: {
			validator(el) {
				return el === this.password;
			},
			message: 'Confirm password not the same with password entered'
		}
	},
	active: {
		type: Boolean,
		default: true,
		select: false
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date
});

// HASH PLAIN TEXT PASSWORD BEFORE SAVING INTO THE DB
userSchmea.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);
	// DELETE CONFIRM PASSWOD AFTER USAGE
	this.confirmPassword = undefined;
	next();
});

// UPDATE USER'S passwordChangedAt property
userSchmea.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();

	this.passwordChangedAt = Date.now() - 1000;
	next();
});

// RETURN ONLY ACTIVE USERS
userSchmea.pre(/^find/, function (next) {
	this.find({ active: true });
	next();
});

// REMOVE SOME FIELDS ON THE USER OBJECT
userSchmea.methods.toJSON = function () {
	const userObj = this.toObject();
	delete userObj.password;
	delete userObj.__v;
	return userObj;
};

// INTANCE METHOD TO CHECK PASSWORD VALIDITY
userSchmea.methods.checkPasswordValidity = async function (
	userEnteredPassword,
	userSavedPassword
) {
	return await bcrypt.compare(userEnteredPassword, userSavedPassword);
};

// CHECK IF USER HAS CHNAGED PASSWORD
userSchmea.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const convertToTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000
		);

		return JWTTimestamp < convertToTimestamp;
	}

	// FALSE MEANS NOT CHANGED
	return false;
};

userSchmea.methods.createPasswordResetToken = function () {
	// GENERATE THE RESET TOKEN
	const resetToken = crypto.randomBytes(32).toString('hex');

	// HASH THE RESET TOKEN
	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	//console.log({ resetToken }, this.passwordResetToken);

	// SET THE RESET TOKEN EXPIRY TIME - 10 minutes
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	// RETURN THE RESET TOKEN
	return resetToken;
};

module.exports = model('User', userSchmea);
