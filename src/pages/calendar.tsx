import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateTime } from 'luxon';

const MyCalendar: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null); // Ref to track the scrollable container
  const calendarRefs = useRef<(ReturnType<FullCalendar['getApi']> | null)[]>(
    []
  ); // Array of refs to FullCalendar APIs
  const [currentMonth, setCurrentMonth] = useState<string>(
    DateTime.local().toFormat('MMMM yyyy')
  ); // Pinned header month
  const [monthsToShow, setMonthsToShow] = useState<string[]>([
    DateTime.local().toISODate(),
  ]); // Show current month first

  const today = DateTime.local(); // Get the current date

  // Sample events
  const [events] = useState([
    { title: 'Event 1', start: '2024-09-01' },
    { title: 'Event 2', start: '2024-09-05' },
    { title: 'Event 3', start: '2024-10-01' },
  ]);

  // Load more months when scrolling
  const loadMoreMonths = (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      const firstMonthShown = DateTime.fromISO(monthsToShow[0]);
      if (firstMonthShown <= today.startOf('month')) {
        return; // Don't load past the current month
      }
    }

    let newMonth: DateTime;
    if (direction === 'next') {
      newMonth = DateTime.fromISO(monthsToShow[monthsToShow.length - 1]).plus({
        months: 1,
      });
    } else {
      newMonth = DateTime.fromISO(monthsToShow[0]).minus({ months: 1 });
    }

    const newMonthISO = newMonth.toISODate()!;
    setMonthsToShow((prevMonths) =>
      direction === 'next'
        ? [...prevMonths, newMonthISO]
        : [newMonthISO, ...prevMonths]
    );
  };

  // Attach scroll event handler
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      // Log scroll positions for debugging
      console.log('scrollTop:', scrollTop);
      console.log('scrollHeight:', scrollHeight);
      console.log('clientHeight:', clientHeight);

      // Load the next month if scrolling to the bottom
      if (scrollTop + clientHeight >= scrollHeight - 1) {
        console.log('Loading next month');
        loadMoreMonths('next');
      }

      // Load the previous month if scrolling to the top
      if (scrollTop <= 0) {
        console.log('Loading previous month');
        loadMoreMonths('prev');
      }

      // Update the current month based on the closest visible calendar
      let bestMonth = '';
      let smallestDistance = Number.POSITIVE_INFINITY;

      calendarRefs.current.forEach((calendarApi, index) => {
        if (calendarApi) {
          const calendarEl = container.querySelectorAll('.fc')[index]; // Get each FullCalendar DOM element
          if (calendarEl) {
            const rect = calendarEl.getBoundingClientRect();
            const distanceFromViewportCenter = Math.abs(
              rect.top + rect.height / 2 - window.innerHeight / 2
            ); // Distance from center of viewport

            if (distanceFromViewportCenter < smallestDistance) {
              smallestDistance = distanceFromViewportCenter;
              const monthInView = DateTime.fromJSDate(
                calendarApi.view.currentStart
              ).toFormat('MMMM yyyy');
              bestMonth = monthInView;
            }
          }
        }
      });

      if (bestMonth && bestMonth !== currentMonth) {
        setCurrentMonth(bestMonth);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [monthsToShow, currentMonth]);

  return (
    <div>
      {/* Pinned header displaying the current month */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#f0f0f0',
          padding: '10px',
          zIndex: 1000,
        }}
      >
        <h2>{currentMonth}</h2>
      </div>

      {/* Scrollable container */}
      <div
        style={{ height: '100vh', overflowY: 'auto', marginTop: '60px' }}
        ref={containerRef}
      >
        {monthsToShow.map((monthStart, index) => (
          <div key={monthStart} style={{ marginBottom: '40px' }}>
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              initialDate={monthStart} // Start the calendar at the given month
              editable={true}
              selectable={true}
              dayMaxEvents={true}
              events={events}
              headerToolbar={false} // Disable the header toolbar to remove the navigation buttons
              dayHeaders={false}
              showNonCurrentDates={true}
              ref={(el) => {
                if (el) {
                  calendarRefs.current[index] = el.getApi(); // Access the Calendar API and store it in the refs array
                }
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCalendar;
