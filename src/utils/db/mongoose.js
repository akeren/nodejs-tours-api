const { connect } = require('mongoose');
const configs = require('../../config/configs');

(async () => {
	try {
		await connect(configs.MONGODB_URL, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false
		});
	} catch (error) {
		console.error(error);
	}
})();
