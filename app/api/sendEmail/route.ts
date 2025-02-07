import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type EmailBody = {
  to: string;
  subject: string;
  text: string;
};

export async function POST(request: NextRequest) {
  try {
    const body: EmailBody = await request.json();
    const { to, subject, text } = body;

    // Validate the input
    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create a transporter object
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

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error sending email', details: error.message },
      { status: 500 }
    );
  }
}
