import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';

export async function POST(req: NextRequest, res: NextResponse) {
  const formData = await req.formData();

  const file: any = formData.get('file');
  const fileBuffer = file.stream();

  const filename: any = formData.get('fileName');

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
    const googleRes = await drive.files.create({
      requestBody: {
        name: filename,
        mimeType: 'application/pdf',
        parents: ['1schkzvm_b46UGovHpQ2uH-X-nJtlm32_'],
        driveId: '1schkzvm_b46UGovHpQ2uH-X-nJtlm32_',
      },
      media: {
        mimeType: 'application/pdf',
        body: Readable.from(fileBuffer),
      },
      supportsAllDrives: true,
    });
    console.log(googleRes);

    return NextResponse.json(
      { message: 'File uploaded successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'Error uploading file', error: (error as Error).message },
      { status: 500 }
    );
  }
}
