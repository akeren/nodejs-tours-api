require('dotenv').config({ path: './../../config.env' });
const nodemailer = require('nodemailer');
const sendEmail = async (options) => {
	// CREATE A TRANSPORTER
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD
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
