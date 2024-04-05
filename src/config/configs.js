require("dotenv").config({ path: "config.env" });

const configs = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || "",
  MONGODB_URL: process.env.MONGODB_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "",
  JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN || "",
  EMAIL_USERNAME: process.env.EMAIL_USERNAME || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_PORT: process.env.EMAIL_PORT || "",
};

module.exports = configs;
