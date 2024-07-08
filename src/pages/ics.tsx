import React, { useState, useEffect } from 'react';
import { EventAttributes } from 'ics';
import { writeFileSync } from 'fs';
import * as ics from "ics";

export default function CalendarDownload() {
  const [absences, setabsences] = useState<EventAttributes[]>([]);;

  const searchAbsences = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/getAbsences/');
      const data = await res.json();
      const events = data.body.events;

      setabsences(events);
      console.log(events);
    } catch (err) {
      console.log(err);
    }
  };

  async function handleDownload() {
    searchAbsences(event);
    const filename = 'Sistema.ics';
    const file = await new Promise((resolve, reject) => {
      ics.createEvents(absences as EventAttributes[], (error, value) => {
        if (error) {
          reject(error);
        }

        resolve(new File([value], filename, { type: 'text/calendar' }));
      });
    });
    const url = URL.createObjectURL(file as File);

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



  return (
    <div>
      <button onClick={handleDownload}>Download iCal File</button>
    </div>
  );
}
