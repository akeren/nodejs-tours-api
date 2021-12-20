require('dotenv').config({ path: './../../config.env' });
const nodemailer = require('nodemailer');
const configs = require('../config/configs');
const sendEmail = async (options) => {
	// CREATE A TRANSPORTER
	const transporter = nodemailer.createTransport({
		host: configs.EMAIL_HOST,
		port: configs.EMAIL_PORT,
		auth: {
			user: configs.EMAIL_USERNAME,
			pass: configs.EMAIL_PASSWORD
		}
	});

	// DEFINE MAIL OPTIONS
	const mailOptions = {
		from: 'Kater Akeren <akerenkater@gmail.com>',
		to: options.email,
		subject: options.subject,
		text: options.message
	};

	// SEND THE EMAIL
	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
