const winston = require("winston");
const { createLogger } = require("winston");
const configs = require("../config/configs");

const logger = createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

const productionErrorLogsTransport = new winston.transports.File({
  level: "error",
  filename: "logs/errors.log",
  format: winston.format.combine(
    winston.format.timestamp({ format: "DDD/MM/YYYY HH:mm:ss" })
  ),
});

if (configs.NODE_ENV === "production") {
  logger.add(productionErrorLogsTransport, { timestamp: true });
}

module.exports = logger;
