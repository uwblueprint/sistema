import React, { useState } from 'react';
import * as ics from 'ics';
import { writeFileSync } from 'fs';

export default function CalendarDownload() {
  const [absences, setabsences] = useState('');
  const event = {
    start: [2024, 7, 3, 6, 30],
    duration: { hours: 2, minutes: 30 },
    title: 'Commit Arson at E7',
    description: 'Annual Fire Festival created by David Lu',
    location: 'Engineering 7, University of Waterloo',
    url: 'https://www.uwaterloo.ca',
    geo: { lat: 40.0095, lon: 105.2669 },
    categories: ['Engsoc', 'Teambuilding', 'Crimes'],
    status: 'TENTATIVE',
    busyStatus: 'BUSY',
    organizer: { name: 'thetool', email: 'thetool@uwaterloo.ca' },
    attendees: [
      {
        name: 'Mike Hunt',
        email: 'mike69420@uwaterloo.com',
        rsvp: true,
        partstat: 'TENTATIVE',
        role: 'REQ-PARTICIPANT',
      },
      {
        name: 'Among us',
        email: 'amongus@example2.org',
        rsvp: true,
        partstat: 'TENTATIVE',
        role: 'REQ-PARTICIPANT',
      },
    ],
  };

  async function handleDownload() {
    const filename = 'Arson.ics';
    const file = await new Promise((resolve, reject) => {
      ics.createEvent(event, (error, value) => {
        if (error) {
          reject(error);
        }

        resolve(new File([value], filename, { type: 'text/calendar' }));
      });
    });
    const url = URL.createObjectURL(file);

    // trying to assign the file URL to a window could cause cross-site
    // issues so this is a workaround using HTML5
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
  }

  const searchAbsences = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/getAbsences/');
      const data = await res.json;
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <button onClick={handleDownload}>Download iCal File</button>

      <button onClick={searchAbsences}>Absences</button>
    </div>
  );
}
