import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

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

  // Validate the input
  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Create a transporter object
  try {
    console.log(process.env.EMAIL_USER);
    console.log(process.env.EMAIL_SERVICE);
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // Verify connection configuration
    await new Promise((resolve, reject) => {
      transporter.verify(function (error, success) {
        if (error) {
          console.log('Error verifying SMTP configuration:', error);
          reject(error);
        } else {
          console.log('SMTP Server is ready to take messages');
          resolve(success);
        }
      });
    });

    // Configure the mailOptions object
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text,
    };

    // Send the email
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending email:', err);
          reject(err);
        } else {
          console.log('Email sent successfully:', info);
          resolve(info);
        }
      });
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: 'Error sending email', details: error.message });
  }
}
