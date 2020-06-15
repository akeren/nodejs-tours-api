const AppError = require('./../../../utils/appError');

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
	const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
	const message = `Duplicate field value: ${value}. Please use another value! `;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);
	let modifyErrors = '';
	errors.forEach((err) => {
		modifyErrors += `${err}. `;
	});
	const message = `Invalid Input data: ${modifyErrors}`;
	return new AppError(message, 400);
};

const handleJWTError = () =>
	new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
	new AppError('Token has expired. Please log in again!', 401);

const sendDevError = (err, res) => {
	const statusCode = err.statusCode || 500;
	const status = err.status || 'error';

	res.status(statusCode).json({
		status,
		error: err,
		message: err.message,
		stack: err.stack
	});
};

const sendProdError = (err, res) => {
	// OPERATIONAL, tRUSTED error,
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message
		});
	} else {
		// PROGRAMMING AND OTHER UNKNOWN ERRORS
		res.status(500).json({
			status: 'error',
			message: 'Oops! Something went vey wrong...!',
			error: err
		});
	}
};
module.exports = (err, req, res, next) => {
	if (process.env.NODE_ENV === 'development') {
		sendDevError(err, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };

		if (err.name === 'CastError') error = handleCastErrorDB(error);
		if (err.code === 11000) error = handleDuplicateErrorDB(error);
		if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

		sendProdError(error, res);
	}
};
