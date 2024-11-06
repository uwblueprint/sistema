// /pages/api/debug-env.js

export default function handler(req, res) {
  const maskedEmailUser = process.env.EMAIL_USER
    ? process.env.EMAIL_USER.slice(0, 2) +
      '****' +
      process.env.EMAIL_USER.slice(-2)
    : 'Not set';
  const maskedEmailService = process.env.EMAIL_SERVICE
    ? process.env.EMAIL_SERVICE.slice(0, 2) +
      '****' +
      process.env.EMAIL_SERVICE.slice(-2)
    : 'Not set';

  res.status(200).json({
    EMAIL_USER: maskedEmailUser,
    EMAIL_SERVICE: maskedEmailService,
    EMAIL_USER_LENGTH: process.env.EMAIL_USER
      ? process.env.EMAIL_USER.length
      : 'Not set',
    EMAIL_SERVICE_LENGTH: process.env.EMAIL_SERVICE
      ? process.env.EMAIL_SERVICE.length
      : 'Not set',
  });
}
