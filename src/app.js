const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./api/controllers/helpers/errorController');
const userRouter = require('./api/routes/userRoutes');
const tourRouter = require('./api/routes/tourRoutes');
const reviewRouter = require('./api/routes/reviewRoutes');

const app = express();

/*
 ** GLOBAL MIDDLEWARES
 */

// set security for HTTP Headers
app.use(helmet());

// Logging development requests
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Limit the number of requests allowed from same API
const limiter = rateLimit({
	windowMs: 60 * 60 * 1000,
	max: 100,
	message: 'Too many requests from this IP, try again in an hour!'
});
app.use('/api/', limiter);

// Body parser, reading data from the req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL Query Injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
	hpp({
		whitelist: [
			'duration',
			'ratingsQuantity',
			'ratingsAverage',
			'maxGroupSize',
			'price',
			'difficulty'
		]
	})
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

/*
 ** ROUTES
 */
app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/reviews', reviewRouter);

/*
 ** HANDLING UNHANDLED ROUTES
 */
app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this Server!`, 404));
});

/*
 ** GLOBAL ERROR
 */
app.use(globalErrorHandler);

module.exports = app;
