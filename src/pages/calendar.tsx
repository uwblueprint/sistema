import React, { useRef, useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Flex, useToast, useTheme } from '@chakra-ui/react';
import { EventInput, EventContentArg } from '@fullcalendar/core';
import { AbsenceWithRelations } from '../../app/api/getAbsences/route';
import Sidebar from '../components/CalendarSidebar';
import CalendarHeader from '../components/CalendarHeader';
import { Global } from '@emotion/react';

const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventInput[]>([]);
  const [searchQuery, setSearchQuery] = useState<{
    titles: string[];
    locations: string[];
  }>({
    titles: [],
    locations: [],
  });
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const toast = useToast();
  const theme = useTheme();

  const renderEventContent = useCallback(
    (eventInfo: EventContentArg) => (
      <Box>
        <Box className="fc-event-title-container">
          <Box className="fc-event-title fc-sticky">
            {eventInfo.event.title}
          </Box>
        </Box>
        <Box className="fc-event-title fc-sticky">
          {eventInfo.event.extendedProps.location}
        </Box>
      </Box>
    ),
    []
  );

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

  useEffect(() => {
    const { titles, locations } = searchQuery;

    const filtered = events.filter((event) => {
      const titleMatch = titles.some((title) =>
        event.title?.toLowerCase().includes(title.toLowerCase())
      );
      const locationMatch = locations.some((location) =>
        event.location?.toLowerCase().includes(location.toLowerCase())
      );
      return titleMatch && locationMatch;
    });

    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  return (
    <>
      <Global
        styles={`
          .fc .fc-daygrid-day-top {
            flex-direction: row;
          }
          .fc th {
            text-transform: uppercase;
            font-size: ${theme.fontSizes.sm};
            font-weight: ${theme.fontWeights.normal};
          }
          .fc-day-today {
            background-color: inherit !important;
          }
          .fc-daygrid-day-number {
            margin-left: 7px;
            margin-top: 5px;
            font-size: ${theme.fontSizes.md};
            font-weight: ${theme.fontWeights.normal};
          }
          .fc-day-today .fc-daygrid-day-number {
            background-color: ${theme.colors.blue[500]};
            color: white;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .fc-weekend {
            background-color: rgba(0, 0, 0, 0.05) !important;
          }
          .fc-event {
            padding: ${theme.space[2]} ${theme.space[3]};
            margin: ${theme.space[2]} 0;
            border-radius: ${theme.radii.md};
          }
          .fc-event-title {
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: ${theme.fontSizes.sm};
            font-weight: ${theme.fontWeights.normal};
          }
        `}
      />

      <Flex height="100vh">
        <Sidebar setSearchQuery={setSearchQuery} />
        <Box flex={1} padding={theme.space[4]} height="100%">
          <CalendarHeader
            currentMonthYear={currentMonthYear}
            onTodayClick={handleTodayClick}
            onPrevClick={handlePrevClick}
            onNextClick={handleNextClick}
          />
          <FullCalendar
            ref={calendarRef}
            headerToolbar={false}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="100%"
            events={filteredEvents}
            eventContent={renderEventContent}
            timeZone="local"
            datesSet={updateMonthYearTitle}
            fixedWeekCount={false}
            dayCellClassNames={({ date }) => addWeekendClass(date)}
          />
        </Box>
      </Flex>
    </>
  );
};

export default Calendar;
