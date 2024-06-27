/* eslint-disable prettier/prettier */
import { NextApiRequest, NextApiResponse } from 'next';

const nodemailer = require('nodemailer');

type Data = {
  message?: string;
  error?: string;
  details?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { to, subject, text } = req.body;

  // Create a transporter object
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ['kellypham@uwblueprint.org'],
        pass: 'spnu pjuc zvxx subj', // app password
      },
    });

    // Configure the mailoptions object
    const mailOptions = {
      from: 'kellypham@uwblueprint.org',
      to: to,
      subject: subject,
      text: text,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Error sending email', details: error.message });
  }
}
