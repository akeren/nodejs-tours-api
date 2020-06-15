const { connect } = require('mongoose');

(async () => {
	try {
		await connect(process.env.MONGODB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});
	} catch (error) {
		console.error(error);
	}
})();
