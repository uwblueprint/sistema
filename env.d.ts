declare global {
  namespace NodeJS {
    interface ProcessEnv {
      AUTH_GOOGLE_ID: string;
      AUTH_GOOGLE_SECRET: string;
      AUTH_SECRET: string;
      DATABASE_URL: string;
      GDRIVE_CLIENT_EMAIL: string;
      GDRIVE_CLIENTID: string;
      GDRIVE_PRIVTKEY: string;
      DRIVE_PROJECTID: string;
    }
  }
}

export {};
