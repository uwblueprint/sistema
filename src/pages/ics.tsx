import { EventAttributes, createEvents } from 'ics';

export default function CalendarDownload() {
  const searchAbsences = async () => {
    try {
      const res = await fetch('/api/getAbsences/');
      const data = await res.json();
      const events = data.body.events;
      console.log(events);
      return events;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const createCalendarFile = (events: EventAttributes[]): Promise<File> => {
    return new Promise((resolve, reject) => {
      createEvents(events, (error, value) => {
        if (error) {
          reject(error);
        } else {
          resolve(new File([value], 'Sistema.ics', { type: 'text/calendar' }));
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
    try {
      event.preventDefault();
      const events = await searchAbsences();
      const file = await createCalendarFile(events);
      downloadFile(file);
    } catch (error) {
      console.error('Error during download process:', error);
      // Handle the error appropriately, e.g., show an error message to the user
    }
  };

  return (
    <div>
      <button onClick={handleDownload}>Download iCal File</button>
    </div>
  );
}
