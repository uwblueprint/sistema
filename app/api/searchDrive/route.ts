import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest, res: NextResponse) {
  const private_key = process.env.GDRIVE_PRIVATE_KEY.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    projectId: process.env.GDRIVE_PROJECTID,
    scopes: 'https://www.googleapis.com/auth/drive',
    credentials: {
      type: 'service_account',
      client_id: process.env.GDRIVE_CLIENT_ID,
      client_email: process.env.GDRIVE_CLIENT_EMAIL,
      private_key: private_key,
    },
  });
  const drive = google.drive({ version: 'v3', auth });

  try {
    const res = await drive.files.list({
      q: "'1schkzvm_b46UGovHpQ2uH-X-nJtlm32_' in parents",
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
    });

    
     
    const files = res.data.files;
    return NextResponse.json({ status: 200, results: { files }, headers :{
      "Cache-Control":
      "no-cache, no-store, max-age=0, must-revalidate"
    }});
  } catch (err) {
    console.log(err);
    throw err;
  }
}
