
function UploadButton() {
    const { google } = require("googleapis");
    const path = require("path");
    const fs = require("fs");

    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REDIRECT_URI =  process.env.REDIRECT_URI;

    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

    const oauth2Client = new google.auth.OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        REDIRECT_URI
    );

    oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

    const drive = google.drive({version: "v3", auth: oauth2Client});

    const filePath = path.join(__dirname, "kermit.jpg");

    async function uploadFile() {
        try {
            const res = await drive.files.create({
                requestBody: {
                    name: "kermit.jpg",
                    mimeType: "image/jpeg",
                },
                media: {
                    body: fs.createReadStream(filePath),
                    mimeType: "image/jpeg",
                },
        });
        console.log(res.data);
       }   catch (err) {
            console.log(err);
        }
    }
    
    return (
        <button>Upload</button>
    );
}

export default UploadButton;