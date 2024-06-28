import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, res: NextResponse) {
  const auth = new google.auth.GoogleAuth({
    projectId: process.env.GDRIVE_PROJECTID,
    scopes: "https://www.googleapis.com/auth/drive",
    credentials: {
      type: "service_account",
      client_id: process.env.GDRIVE_CLIENTID,
      client_email: process.env.GDRIVE_CLIENT_EMAIL,
      private_key: process.env.GDRIVE_PRIVTKEY,
    },
  });
  const drive = google.drive({ version: "v3", auth });

  try {
    const res = await drive.files.list({
      q: "'1schkzvm_b46UGovHpQ2uH-X-nJtlm32_' in parents",
      fields: 'nextPageToken, files(id, name)',
      spaces: 'drive',
    });
    const files = res.data.files;
    return NextResponse.json({"status":200, "results": {files}})

  } catch (err) {
    console.log(err)
    throw err;
  }
}