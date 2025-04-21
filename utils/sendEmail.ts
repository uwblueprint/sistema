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
const ALLOWED_DOMAINS = new Set(
  process.env.ALLOWED_EMAIL_DOMAINS?.split(',') ?? []
);
const isAllowedDomain = (email: string): boolean => {
  const emailDomain = email.split('@')[1]?.toLowerCase();
  return emailDomain ? ALLOWED_DOMAINS.has(emailDomain) : false;
};

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendWithRetry<T>(
  fn: () => Promise<T>,
  retries = 5,
  baseDelay = 500
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable =
        error?.code === 429 ||
        error?.response?.status === 429 ||
        (error?.response?.status >= 500 && error?.response?.status < 600);

      if (!isRetryable || attempt === retries) {
        throw error;
      }

      const jitter = Math.random() * 100;
      const delay = baseDelay * 2 ** attempt + jitter;
      console.warn(
        `Retrying after ${Math.round(delay)}ms due to:`,
        error.message
      );
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw new Error('Retries exhausted');
}

export async function sendEmail({ to, cc, bcc, subject, html }: EmailBody) {
  try {
    const toList = to.filter(isAllowedDomain);
    const ccList = cc?.filter(isAllowedDomain) ?? [];
    const bccList = bcc?.filter(isAllowedDomain) ?? [];

    if (!subject || !html) {
      throw new Error('Missing required email fields');
    }

    if (toList.length === 0 && ccList.length === 0 && bccList.length === 0) {
      console.warn('Skipping email: No valid recipients after filtering.');
      return { success: false, error: 'No recipients' };
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
    const result = await sendWithRetry(() =>
      gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedEmail },
      })
    );

    return { success: true, result };
  } catch (error: any) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}
