import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

type EmailBody = {
  to: string;
  subject: string;
  text: string;
};

const CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

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

    // Get OAuth2 access token
    const accessToken = await oAuth2Client.getAccessToken();

    // Create the email message
    const email = [
      `From: ${EMAIL_USER}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      '',
      text,
    ].join('\n');

    const encodedEmail = Buffer.from(email).toString('base64');

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });

    return NextResponse.json(
      { message: 'Email sent successfully', result },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error sending email', details: error.message },
      { status: 500 }
    );
  }
}
