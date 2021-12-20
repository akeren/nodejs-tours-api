const { connect } = require("mongoose");
const configs = require("../../config/configs");
const logger = require("../logger");

(async () => {
  try {
    await connect(configs.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  } catch (error) {
    logger.error(`${error.name}: ${error.message}`);
  }
})();
