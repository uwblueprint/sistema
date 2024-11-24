import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'node:stream';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const file: File | null = formData.get('file') as File | null;
  let fileBuffer: Buffer;

  if (file instanceof File) {
    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
  } else {
    console.error('No file was provided in the form data');
    return NextResponse.json(
      { error: 'No file was provided' },
      { status: 400 }
    );
  }

  const filename: string | null = formData.get('fileName') as string | null;

  if (!filename) {
    console.error('No filename was provided in the form data');
    return NextResponse.json(
      { error: 'No filename was provided' },
      { status: 400 }
    );
  }

  const private_key = process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!private_key) {
    return NextResponse.json(
      { error: 'Missing Google Drive private key' },
      { status: 500 }
    );
  }

  const auth = new google.auth.GoogleAuth({
    projectId: process.env.GDRIVE_PROJECTID,
    scopes: 'https://www.googleapis.com/auth/drive',
    credentials: {
      type: 'service_account',
      client_email: process.env.GDRIVE_CLIENT_EMAIL,
      private_key: private_key,
    },
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    await drive.files.create({
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
