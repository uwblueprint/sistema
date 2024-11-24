import React, { useRef, useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  AddIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  CalendarIcon,
} from '@chakra-ui/icons';
import { ButtonGroup, Button, IconButton, useToast } from '@chakra-ui/react';
import { EventInput, EventContentArg } from '@fullcalendar/core';
import { AbsenceWithRelations } from '../../types/absence';
import { SistemaLogoColour } from '../components/SistemaLogoColour';

const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const toast = useToast();

  const renderEventContent = (eventInfo: EventContentArg) => {
    return (
      <div>
        <div className="fc-event-title-container">
          <div className="fc-event-title fc-sticky">
            {eventInfo.event.title}
          </div>
        </div>
        <div className="fc-event-title fc-sticky">
          {eventInfo.event.extendedProps.location}
        </div>
      </div>
    );
  };

  const convertAbsenceToEvent = (
    absenceData: AbsenceWithRelations
  ): EventInput => ({
    title: absenceData.subject.name,
    start: absenceData.lessonDate,
    allDay: true,
    display: 'auto',
    location: absenceData.location.name,
  });

  const fetchAbsences = useCallback(async () => {
    try {
      const res = await fetch('/api/getAbsences/');
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }
      const data = await res.json();
      if (!data.events || !Array.isArray(data.events)) {
        throw new Error('Invalid data format.');
      }
      const formattedEvents = data.events.map(convertAbsenceToEvent);
      setEvents(formattedEvents);
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

  const formatMonthYear = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      year: 'numeric',
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const updateMonthYearTitle = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const date = calendarApi.getDate();
      setCurrentMonthYear(formatMonthYear(date));
    }
  }, []);

  const handleTodayClick = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      updateMonthYearTitle();
    }
  }, [updateMonthYearTitle]);

  const handlePrevClick = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.prev();
      updateMonthYearTitle();
    }
  }, [updateMonthYearTitle]);

  const handleNextClick = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.next();
      updateMonthYearTitle();
    }
  }, [updateMonthYearTitle]);

  useEffect(() => {
    updateMonthYearTitle();
  }, [updateMonthYearTitle]);

  const addWeekendClass = (date: Date): string => {
    const day = date.getDay();
    return day === 0 || day === 6 ? 'fc-weekend' : '';
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{
          width: '260px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '150px' }}>
          <SistemaLogoColour />
        </div>

        <Button colorScheme="blue" size={'lg'} leftIcon={<AddIcon />}>
          Declare Absence
        </Button>
      </div>

      <div style={{ flex: 1, padding: '10px', height: '100%' }}>
        <div
          style={{
            display: 'flex',
            marginBottom: '10px',
          }}
        >
          <ButtonGroup isAttached variant="outline">
            <IconButton
              colorScheme="blue"
              onClick={handlePrevClick}
              icon={<ArrowBackIcon />}
              aria-label="Previous"
            />
            <Button
              onClick={handleTodayClick}
              variant="outline"
              colorScheme="blue"
              leftIcon={<CalendarIcon />}
            >
              Today
            </Button>
            <IconButton
              colorScheme="blue"
              onClick={handleNextClick}
              icon={<ArrowForwardIcon />}
              aria-label="Next"
            />
          </ButtonGroup>
          <h2
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '28px',
              textAlign: 'center',
              marginLeft: '30px',
              marginRight: '30px',
            }}
          >
            {currentMonthYear}
          </h2>
        </div>
        <FullCalendar
          ref={calendarRef}
          headerToolbar={false}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="100%"
          events={events}
          eventContent={renderEventContent}
          timeZone="local"
          datesSet={updateMonthYearTitle}
          fixedWeekCount={false}
          dayCellClassNames={({ date }) => addWeekendClass(date)}
        />
        <style>
          {`
            .fc .fc-daygrid-day-top {
              flex-direction: row;
            }
            .fc th {
              text-transform: uppercase;
              font-size: 14px;
              font-style: normal;
              font-weight: 400;
            }
            .fc-day-today {
              background-color: inherit !important;
              color: white;
            }
            .fc-weekend {
              background-color: rgba(0, 0, 0, 0.05) !important;
            }
            .fc-event {
              padding: 2px 5px;
              margin: 2px 0;
              border-radius: 5px;
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

export default Calendar;
