import { NextRequest, NextResponse } from 'next/server';
import { deleteDriveFile } from '@utils/googleDrive';

export async function DELETE(req: NextRequest) {
  const fileId = new URL(req.url).searchParams.get('fileId');
  if (!fileId) {
    return NextResponse.json(
      { message: 'File ID is required' },
      { status: 400 }
    );
  }

  try {
    await deleteDriveFile(fileId);
    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (err: any) {
    console.error('Error deleting file:', err);
    return NextResponse.json(
      { message: 'Error deleting file', error: err.message },
      { status: 500 }
    );
  }
}
