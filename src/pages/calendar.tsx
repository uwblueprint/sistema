import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });
const InputForm = dynamic(() => import('../components/InputForm'), { ssr: false });

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Event {
  title: string;
  date: Date;
  lessonPlan: string;
  reasonOfAbsence: string;
  numberOfStudents: number;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  locationId: number;
  id: string;
}

function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [value, setValue] = useState<Value>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [view, setView] = useState('month');

  useEffect(() => {
    if (typeof window !== 'undefined') {
    }
  }, []);

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = events.filter(event => event.date.toDateString() === date.toDateString());
      return (
        <>
          {dayEvents.map((event, index) => (
            <div key={event.id || index} style={{ marginBottom: '10px' }}>
              <p>{event.title}</p>
              <button onClick={() => handleEventDelete(event)}>Delete</button>
            </div>
          ))}
          <button onClick={() => onAddButtonClick(date)} style={{ marginTop: '10px' }}>+</button>
        </>
      );
    }
    return null;
  };

  const onDateClick = (date: Date) => {
    setFormDate(date);
    setIsFormOpen(true);
  };

  const onAddButtonClick = (date: Date) => {
    setFormDate(date);
    setIsFormOpen(true);
  };

  const handleEventDelete = (eventToDelete: Event) => {
    setEvents(events.filter(event => event !== eventToDelete));
  };

  const renderWeekView = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="week-view">
        {weekDays.map((day) => (
          <div key={day.toDateString()} className="week-day">
            <h3>{day.toDateString()}</h3>
            {events
              .filter((event) => event.date.toDateString() === day.toDateString())
              .map((event, index) => (
                <div key={index}>
                  <p>{event.title}</p>
                  <button onClick={() => handleEventDelete(event)}>Delete</button>
                </div>
              ))}
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = (date: Date) => {
    return (
      <div className="day-view">
        <h2>{date.toDateString()}</h2>
        {events
          .filter((event) => event.date.toDateString() === date.toDateString())
          .map((event, index) => (
            <div key={index}>
              <p>{event.title}</p>
              <button onClick={() => handleEventDelete(event)}>Delete</button>
            </div>
          ))}
      </div>
    );
  };

  const renderCalendar = () => {
    switch (view) {
      case 'month':
        return (
          <Calendar
            onChange={setValue}
            value={value}
            tileContent={tileContent}
          />
        );
      case 'week':
        return renderWeekView(value as Date);
      case 'day':
        return renderDayView(value as Date);
      default:
        return (
          <Calendar
            onChange={setValue}
            value={value}
            tileContent={tileContent}
          />
        );
    }
  };

  return (
    <div className="calendar-container">
      <div className="view-selector">
        <label>
          View:
          <select value={view} onChange={(e) => setView(e.target.value)}>
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </select>
        </label>
      </div>
      {renderCalendar()}
      {isFormOpen && formDate && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setIsFormOpen(false)}>&times;</span>
            <InputForm
              initialDate={formDate}
              onClose={() => setIsFormOpen(false)}
              onAddEvent={(newEvent: Event) => {
                setEvents([...events, newEvent]);
                setIsFormOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;
