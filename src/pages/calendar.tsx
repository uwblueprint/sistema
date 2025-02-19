import React, { useRef, useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Box,
  Flex,
  useToast,
  useTheme,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import { EventInput, EventContentArg, EventClickArg } from '@fullcalendar/core';
import { AbsenceWithRelations } from '../../app/api/getAbsences/absences';
import Sidebar from '../components/CalendarSidebar';
import CalendarHeader from '../components/CalendarHeader';
import { Global } from '@emotion/react';

const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.gotoDate(date);
    }
  };

  useEffect(() => {
    updateMonthYearTitle();
  }, [updateMonthYearTitle]);

  const addSquareClasses = (date: Date): string => {
    const day = date.getDay();
    let classes = day === 0 || day === 6 ? 'fc-weekend' : '';

    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      classes += ' fc-selected-date';
    }

    return classes;
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start
        ? clickInfo.event.start.toISOString()
        : undefined,
      location: clickInfo.event.extendedProps.location || 'Unknown location',
    });
    onOpen();
  };

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
            margin-left: 6px;
            margin-top: 6px;
            font-size: ${theme.fontSizes.xs};
            font-weight: ${theme.fontWeights.normal};
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .fc-day-today .fc-daygrid-day-number {
            background-color: ${theme.colors.primaryBlue[300]};
            color: white;
            border-radius: 50%;
            width: 25px;
            height: 25px;
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
          .fc-selected-date .fc-daygrid-day-number {
            background-color: ${theme.colors.primaryBlue[50]};
            color: ${theme.colors.primaryBlue[300]};
            border-radius: 50%;
            width: 25px;
            height: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            }
        `}
      />

      <Flex height="100vh">
        <Sidebar onDateSelect={handleDateSelect} />
        <Box flex={1} paddingY={theme.space[4]} height="100%">
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
            events={events}
            eventContent={renderEventContent}
            timeZone="local"
            datesSet={updateMonthYearTitle}
            fixedWeekCount={false}
            dayCellClassNames={({ date }) => addSquareClasses(date)}
            eventClick={handleEventClick}
          />
        </Box>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          width={362}
          sx={{ padding: '33px 31px' }}
          borderRadius="16px"
        >
          <ModalHeader fontSize={22} sx={{ padding: '0 0 28px 0' }}>
            Absence Details
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            {selectedEvent && (
              <Box>
                <p>
                  <strong>Subject:</strong> {selectedEvent.title}
                </p>
                <p>
                  <strong>Date:</strong> {selectedEvent.start?.toString()}
                </p>
                <p>
                  <strong>Location:</strong> {selectedEvent.location}
                </p>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Calendar;
