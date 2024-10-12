import React, { useRef, useCallback, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DayHeaderContentArg, DayCellContentArg } from '@fullcalendar/core';

const InfiniteScrollCalendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  const updateCurrentMonth = useCallback(() => {
    if (calendarRef.current && containerRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const containerElement = containerRef.current;

      const viewStart = calendarApi.view.currentStart;
      const viewEnd = calendarApi.view.currentEnd;
      const totalDays =
        (viewEnd.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24);

      const scrollPosition = containerElement.scrollTop;
      const totalHeight =
        containerElement.scrollHeight - containerElement.clientHeight;
      const scrollPercentage = scrollPosition / totalHeight;

      const daysScrolled = Math.floor(totalDays * scrollPercentage);
      const currentDate = new Date(
        viewStart.getTime() + daysScrolled * 24 * 60 * 60 * 1000
      );

      const monthYear = currentDate.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      });
      setCurrentMonth(monthYear);
      setCurrentMonthDate(currentDate);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleScroll = () => {
        requestAnimationFrame(updateCurrentMonth);
      };

      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [updateCurrentMonth]);

  useEffect(() => {
    // Initial update of current month
    updateCurrentMonth();
  }, [updateCurrentMonth]);

  const renderDayHeader = useCallback((arg: DayHeaderContentArg) => {
    return <div className="fc-daygrid-day-top">{arg.text}</div>;
  }, []);

  const renderDayCell = useCallback(
    (arg: DayCellContentArg) => {
      const isCurrentMonth =
        arg.date.getMonth() === currentMonthDate.getMonth() &&
        arg.date.getFullYear() === currentMonthDate.getFullYear();
      return (
        <div
          className={`fc-daygrid-day-number ${isCurrentMonth ? 'current-month' : ''}`}
        >
          {arg.date.getDate()}
        </div>
      );
    },
    [currentMonthDate]
  );

  const renderEventContent = useCallback(() => {
    return null; // This effectively hides all events
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height: '100vh', position: 'relative', overflow: 'auto' }}
    >
      <div
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 1000,
          fontSize: '1.5rem',
          fontWeight: 'bold',
          backgroundColor: 'white',
          padding: '5px',
        }}
      >
        {currentMonth}
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        views={{
          dayGridMonth: {
            duration: { months: 36 }, // Show 3 years at a time
            fixedWeekCount: false,
          },
        }}
        headerToolbar={false}
        height="auto"
        dayHeaderContent={renderDayHeader}
        dayCellContent={renderDayCell}
        eventContent={renderEventContent}
        initialDate={new Date()} // Set initial date to today
        validRange={{
          start: '2000-01-01',
          end: '2050-12-31',
        }}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
      />
      <style>
        {`
          .fc {
            color: grey;
          }
          .fc-day-other {
            background-color: #f3f4f6;
          }
          .fc-day-other .fc-daygrid-day-number {
            opacity: 0.5;
          }
          .fc-daygrid-day-number.current-month {
            color: black;
          }
        `}
      </style>
    </div>
  );
};

export default InfiniteScrollCalendar;
