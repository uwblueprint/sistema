import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

import { Readable } from "node:stream";

export async function POST(req: NextRequest, res: NextResponse) {
  const formData = await req.formData();

  const file: any = formData.get("file");
  const fileBuffer = file.stream();

  const filename: any = formData.get("fileName");


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


  const googleRes = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: "application/pdf",
      parents: ["16teHTj0bEBLRaDM-MfomvmsmEPmzEWps"],
      driveId: "16teHTj0bEBLRaDM-MfomvmsmEPmzEWps"
    },
    media: {
      mimeType: "application/pdf",
      body: Readable.from(fileBuffer),
    },
    supportsAllDrives: true
  });
  console.log(googleRes)
  
  return NextResponse.json({"status":200})

}
