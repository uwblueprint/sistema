import React, { useState } from 'react';
import { EventAttributes, createEvents } from 'ics';

export default function CalendarDownload() {
  const [error, setError] = useState<string | null>(null);

  const searchAbsences = async (): Promise<EventAttributes[]> => {
    try {
      const res = await fetch('/api/getAbsences/');
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      const data = await res.json();
      if (!data.body || !Array.isArray(data.body.events)) {
        throw new Error('Invalid data format.');
      }
      return data.body.events;
    } catch (err) {
      console.error('Error fetching absences:', err);
      throw err;
    }
  };

  const createCalendarFile = (events: EventAttributes[]): Promise<File> => {
    return new Promise((resolve, reject) => {
      createEvents(events, (error, value) => {
        if (error) {
          console.error('Error creating events:', error);
          reject(error);
        } else {
          resolve(new File([value], 'Absences.ics', { type: 'text/calendar' }));
        }
      });
    });
  };

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
      const events = await searchAbsences();
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
