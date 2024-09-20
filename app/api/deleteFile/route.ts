import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get('fileId');

  if (!fileId) {
    return NextResponse.json(
      { message: 'File ID is required' },
      { status: 400 }
    );
  }
  try {
    const private_key = process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!private_key) {
      return NextResponse.json(
        { error: 'Missing Google Drive private key' },
        { status: 500 }
      );
    }

    const auth = new google.auth.GoogleAuth({
      projectId: process.env.GDRIVE_PROJECT_ID,
      scopes: 'https://www.googleapis.com/auth/drive',
      credentials: {
        type: 'service_account',
        client_id: process.env.GDRIVE_PROJECT_ID,
        client_email: process.env.GDRIVE_CLIENT_EMAIL,
        private_key: private_key,
      },
    });

    const drive = google.drive({ version: 'v3', auth });

    // Delete the file
    await drive.files.delete({
      fileId: fileId,
    });

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { message: 'Error deleting file', error: (error as Error).message },
      { status: 500 }
    );
  }
}
