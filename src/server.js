require('dotenv').config({ path: 'config.env' });
const http = require('http');
const app = require('./app');

// HANDLING UNCAUGHT EXCEPTION ERRORS
process.on('uncaughtException', (err) => {
	console.log('UNCAUGHT EXCEPTION! Shutting down...');
	console.error(err.name, err.message);
	process.exit(1);
});

const port = process.env.PORT || 4000;

// DB CONNECTION
require('./utils/db/mongoose');

const server = http.createServer(app);

server.listen(port, () =>
	console.log(`App running at http://127.0.0.1:${port}`)
);

// HANDLING UNHANDLED PROMISE REJECTION ERROR
process.on('unhandledRejection', (err) => {
	console.error(err.name, err.message);
	console.log('UNHANDLED REJECTION! Shutting down Server....!');
	server.close(() => {
		process.exit(1);
	});
});
