const nodemailer = require('nodemailer');
const config = require('../config/env'); // expects SMTP settings in env

// Create transporter using env variables
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT) || 587,
  secure: config.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS
  }
});

/**
 * Sends an email.
 * @param {string} to Recipient email address
 * @param {string} subject Email subject
 * @param {string} html HTML body of the email
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: config.SMTP_FROM || `Campus Resolve <${config.SMTP_USER}>`,
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
