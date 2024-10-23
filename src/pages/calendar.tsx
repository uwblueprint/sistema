import React, { useRef, useCallback, useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { DayHeaderContentArg, DayCellContentArg } from '@fullcalendar/core';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import InputForm from '../components/InputForm';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  useToast,
} from '@chakra-ui/react';
import { EventInput } from '@fullcalendar/core';
import { Absence, FetchAbsenceResponse } from '../../types/absence';

const renderEventContent = (eventInfo) => {
  return (
    <div>
      <div className="fc-event-title-container">
        <div className="fc-event-title fc-sticky">{eventInfo.event.title}</div>
      </div>
      <div className="fc-event-title fc-sticky">
        {eventInfo.event.extendedProps.location}
      </div>
    </div>
  );
};
const InfiniteScrollCalendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const toast = useToast();

  const convertAbsenceToEvent = (absenceData: Absence): EventInput => {
    return {
      title: absenceData.subject.name,
      start: absenceData.lessonDate,
      allDay: true,
      display: 'auto',
      location: absenceData.location.name,
    };
  };

  const fetchAbsences = useCallback(async () => {
    try {
      const res = await fetch('/api/absence');
      if (res.ok) {
        const data: FetchAbsenceResponse = await res.json();
        setEvents(
          data.absences.map((absence) => convertAbsenceToEvent(absence))
        );
        console.log(data);
      } else {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (error) {
      console.error('Error fetching absences:', error);
      toast({
        title: 'Failed to fetch absences',
        description:
          'There was an error loading the absence data. Please try again later.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

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

  const handleTodayClick = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      updateCurrentMonth();

      // Scroll to today's date
      if (containerRef.current) {
        const todayElement =
          containerRef.current.querySelector('.fc-day-today');
        if (todayElement) {
          todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [updateCurrentMonth]);

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

  const handleDateClick = (info: DateClickArg) => {
    setFormDate(info.date);
    setIsFormOpen(true);
  };

  // Calculate the start date for the calendar (5 years ago)
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  // Calculate the end date for the calendar (5 years from now)
  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 3);

  const handleAddAbsence = async (absence: Absence) => {
    try {
      const response = await fetch('/api/absence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(absence),
      });

      if (!response.ok) {
        throw new Error('Failed to add absence');
      }

      const data = await response.json();
      return data.newAbsence;
    } catch (error) {
      console.log('Error adding absence:', error);
      return null;
    }
  };

  return (
    <div>
      <div
        style={{
          top: '10px',
          left: '10px',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white',
          padding: '10px',
        }}
      >
        <div
          style={{
            flexDirection: 'row',
            columnGap: '12px',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            {currentMonth}
          </span>
          <Button onClick={handleTodayClick} colorScheme="blue">
            Today
          </Button>
        </div>

        <Button
          onClick={() => {
            setIsFormOpen(true);
            setFormDate(new Date());
          }}
        >
          Declare Absence
        </Button>
      </div>
      <div
        ref={containerRef}
        style={{ height: '90vh', position: 'relative', overflow: 'auto' }}
      >
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, interactionPlugin]}
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
          initialDate={startDate} // Set initial date to the start of the range
          validRange={{
            start: startDate,
            end: endDate,
          }}
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          events={events}
          eventContent={renderEventContent}
          eventDisplay="auto"
          dateClick={handleDateClick}
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
                    onAddAbsence={handleAddAbsence}
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
          .fc-event {
            border: none;
            background-color: #3788d8;
            color: white;
            padding: 2px 5px;
            margin: 1px 0;
            border-radius: 3px;
          }
          .fc-event-main-frame {
            display: flex;
            flex-direction: column;
          }
          .fc-event-time {
            font-weight: bold;
            margin-bottom: 2px;
          }
          .fc-event-title {
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}
        </style>
      </div>
    </div>
  );
};

export default InfiniteScrollCalendar;
