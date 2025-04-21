import { google } from 'googleapis';

type EmailBody = {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
};

const CLIENT_ID = process.env.AUTH_GOOGLE_ID!;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET!;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN!;
const EMAIL_USER = process.env.EMAIL_USER!;
const ALLOWED_DOMAIN = process.env.SISTEMA_EMAIL_DOMAIN!;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

export async function sendEmail({ to, cc, bcc, subject, html }: EmailBody) {
  try {
    const filterByDomain = (addr: string) =>
      addr.trim().toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`);

    const toList = to.filter(filterByDomain);
    const ccList = cc?.filter(filterByDomain) ?? [];
    const bccList = bcc?.filter(filterByDomain) ?? [];

    if (!subject || !html) {
      throw new Error('Missing required email fields');
    }

    const emailParts = [
      `From: ${EMAIL_USER}`,
      `To: ${toList.join(',')}`,
      ccList.length ? `Cc: ${ccList.join(',')}` : '',
      bccList.length ? `Bcc: ${bccList.join(',')}` : '',
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset="UTF-8"',
      '',
      html,
    ]
      .filter(Boolean)
      .join('\r\n');

    const encodedEmail = Buffer.from(emailParts)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedEmail },
    });

    return { success: true, result };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}
