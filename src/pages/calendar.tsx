import React, { useRef, useCallback, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DayHeaderContentArg, DayCellContentArg } from '@fullcalendar/core';
import InputForm from '../components/InputForm';
import DeclareAbsenceButton from '../components/DeclareAbsenceButon';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
} from '@chakra-ui/react';

const InfiniteScrollCalendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<Date | null>(null);

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

    // Auto-scroll to current month
    const scrollToCurrentMonth = () => {
      if (calendarRef.current && containerRef.current) {
        const calendarApi = calendarRef.current.getApi();
        const containerElement = containerRef.current;
        const today = new Date();
        const viewStart = calendarApi.view.currentStart;
        const totalDays =
          (today.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24);
        const totalHeight =
          containerElement.scrollHeight - containerElement.clientHeight;
        const scrollPosition = (totalDays / (4 * 365)) * totalHeight; // 10 years total
        containerElement.scrollTop = scrollPosition;
      }
    };

    // Wait for the calendar to render before scrolling
    setTimeout(scrollToCurrentMonth, 100);
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

  // Calculate the start date for the calendar (5 years ago)
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Calculate the end date for the calendar (5 years from now)
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 3);

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
            duration: { years: 4 }, // Show 10 years at a time (5 years before and 5 years after the current date)
            fixedWeekCount: false,
          },
        }}
        headerToolbar={false}
        height="auto"
        dayHeaderContent={renderDayHeader}
        dayCellContent={renderDayCell}
        eventContent={renderEventContent}
        initialDate={startDate} // Set initial date to the start of the range
        validRange={{
          start: startDate,
          end: endDate,
        }}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
      />

      <DeclareAbsenceButton
        onClick={() => {
          setIsFormOpen(true);
          setFormDate(new Date());
        }}
      />

      {isFormOpen && formDate && (
        <>
          <div
            style={{
              backgroundColor: '#D5D3D3', // Semi-transparent dark background
            }}
          />
          <Modal isOpen={true} onClose={() => setIsFormOpen(false)}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Add Absence</ModalHeader>
              <ModalBody>
                <InputForm
                  initialDate={formDate}
                  onClose={() => setIsFormOpen(false)}
                  //onAddAbsence={addAbsence}
                />
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      )}

      <style>
        {`
          .fc {
            color: grey;
          }
          .fc-day-other {
            background-color: #f3f4f6;
          }
          .fc-day-other .fc-daygrid-day-number {
-           opacity: 0.5;
-         }
          .fc-daygrid-day-number.current-month {
            color: black;
          }
        `}
      </style>
    </div>
  );
};

export default InfiniteScrollCalendar;
