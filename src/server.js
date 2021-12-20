const http = require('http');
const app = require('./app');
const configs = require('./config/configs');
const logger = require('./utils/logger');

// HANDLING UNCAUGHT EXCEPTION ERRORS
process.on('uncaughtException', (err) => {
	logger.info('UNCAUGHT EXCEPTION! Shutting down...');
	logger.error(err.name, err.message);
	process.exit(1);
});

const port = configs.PORT;

// DB CONNECTION
require('./utils/db/mongoose');

const server = http.createServer(app);

server.listen(port, () =>
	logger.info(`App running at http://127.0.0.1:${port}`)
);

// HANDLING UNHANDLED PROMISE REJECTION ERROR
process.on('unhandledRejection', (err) => {
	logger.info('UNHANDLED REJECTION! Shutting down Server....!');
	logger.error(`${err.name}: ${err.message}`);
	server.close(() => {
		process.exit(1);
	});
});
