import { google } from 'googleapis';

export async function deleteDriveFile(fileId: string) {
  const privateKey = process.env.GDRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKey) throw new Error('Missing Google Drive private key');

  const auth = new google.auth.GoogleAuth({
    projectId: process.env.GDRIVE_PROJECT_ID,
    scopes: 'https://www.googleapis.com/auth/drive',
    credentials: {
      type: 'service_account',
      client_email: process.env.GDRIVE_CLIENT_EMAIL,
      private_key: privateKey,
    },
  });

  const drive = google.drive({ version: 'v3', auth });
  await drive.files.delete({ fileId });
}
