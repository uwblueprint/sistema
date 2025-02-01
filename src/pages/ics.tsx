import React, { useState } from 'react';
import {
  getAbsenceEvents,
  createCalendarFile,
} from '../../app/api/ics/[id]/ics';

export default function CalendarDownload() {
  const [error, setError] = useState<string | null>(null);

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const events = await getAbsenceEvents();
      const file = await createCalendarFile(events);
      downloadFile(file);
    } catch (error) {
      console.error('Error during download process:', error);
      setError('Failed to download calendar. Please try again later.');
    }
  };

  return (
    <div>
      <button onClick={handleDownload}>Download iCal File</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
