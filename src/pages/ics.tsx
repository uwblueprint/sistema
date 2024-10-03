import React, { useState } from 'react';
import { EventAttributes, createEvents } from 'ics';

export default function CalendarDownload() {
  const [error, setError] = useState<string | null>(null);

  const searchAbsences = async (): Promise<EventAttributes[]> => {
    try {
      const res = await fetch('/api/getAbsences/');
      const data = await res.json();
      const events = data.body.events;
      console.log('Fetched events:', events);

      // Ensure events are in the correct format for ics
      return events.map((event: any) => ({
        start: [event.startYear, event.startMonth, event.startDay],
        end: [event.endYear, event.endMonth, event.endDay],
        title: event.title,
        description: event.description,
        // Add any other required fields
      }));
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
      if (events.length === 0) {
        throw new Error('No events found');
      }
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
