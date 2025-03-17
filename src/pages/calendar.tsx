import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useTheme,
  useToast,
} from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { Absence, Prisma } from '@prisma/client';
import { AbsenceAPI } from '@utils/types';
import useUserData from '@utils/useUserData';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CalendarHeader from '../components/CalendarHeader';
import InputForm from '../components/InputForm';
import CalendarSidebar from '../components/CalendarSidebar';

const Calendar: React.FC = () => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<EventInput[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventInput[]>([]);
  const [searchQuery, setSearchQuery] = useState<{
    subjectIds: number[];
    locationIds: number[];
  }>({
    subjectIds: [],
    locationIds: [],
  });
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const toast = useToast();
  const theme = useTheme();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const userData = useUserData();

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

  const convertAbsenceToEvent = (absenceData: AbsenceAPI): EventInput => ({
    title: absenceData.subject.name,
    start: absenceData.lessonDate,
    allDay: true,
    display: 'auto',
    location: absenceData.location.name,
    subjectId: absenceData.subject.id,
    locationId: absenceData.location.id,
    isClaimed: absenceData.isClaimed || false, //THIS NEEDS TO BE CHANGED BASED ON WHEN THE USER & SEPARATE CALENDAR PANELS PAGE IS MERGED
  });

  const handleAddAbsence = async (
    absence: Prisma.AbsenceCreateManyInput
  ): Promise<Absence | null> => {
    try {
      const res = await fetch('/api/addAbsence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(absence),
      });

      if (!res.ok) {
        throw new Error(`Failed to add absence: ${res.statusText}`);
      }

      const addedAbsence = await res.json();
      await fetchAbsences();
      return addedAbsence;
    } catch (error) {
      console.error('Error adding absence:', error);
      return null;
    }
  };

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

  const handleDateClick = (arg: { date: Date }) => {
    setSelectedDate(arg.date);
    onOpen();
  };

  const handleTodayClick = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.today();
      const today = new Date();
      setSelectedDate(today);
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

    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      classes += ' fc-today';
    }

    if (
      selectedDate &&
      date.toDateString() === selectedDate.toDateString() &&
      !isToday
    ) {
      classes += ' fc-selected-date';
    }

    return classes;
  };

  const handleDeclareAbsenceClick = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const today = calendarApi.getDate();
      setSelectedDate(today);
      onOpen();
    }
  };
  useEffect(() => {
    const { subjectIds, locationIds } = searchQuery;

    const filtered = events.filter((event) => {
      const subjectIdMatch = subjectIds.includes(event.subjectId);
      const locationIdMatch = locationIds.includes(event.locationId);
      return subjectIdMatch && locationIdMatch;
    });

    setFilteredEvents(filtered);
  }, [searchQuery, events]);

  const dayCellDidMount = useCallback(
    (info: { el: HTMLElement; date: Date }) => {
      const hasEventsOnDate = events.some((event) => {
        if (!event.start) return false;

        const eventDate = new Date(event.start as string);
        return eventDate.toDateString() === info.date.toDateString();
      });

      console.log(
        `Date: ${info.date.toDateString()}, Has events: ${hasEventsOnDate}`
      );

      if (hasEventsOnDate) {
        const badgeContainer = document.createElement('div');
        badgeContainer.style.position = 'absolute';
        badgeContainer.style.top = '15px';
        badgeContainer.style.right = '6px';
        badgeContainer.style.display = 'flex';
        badgeContainer.style.width = '68px';
        badgeContainer.style.padding = '2px 5px';
        badgeContainer.style.justifyContent = 'center';
        badgeContainer.style.alignItems = 'center';
        badgeContainer.style.gap = '5px';
        badgeContainer.style.flexShrink = '0';
        badgeContainer.style.borderRadius = '5px';
        badgeContainer.style.border = '1px solid #D2D2D2';
        badgeContainer.style.zIndex = '20';

        const iconSvg = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'svg'
        );
        iconSvg.setAttribute('width', '15');
        iconSvg.setAttribute('height', '14');
        iconSvg.setAttribute('viewBox', '0 0 15 14');
        iconSvg.setAttribute('fill', 'none');

        const path = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'path'
        );
        path.setAttribute(
          'd',
          'M7.49995 4.45977L7.49995 6.90095M7.49995 9.34213L7.49385 9.34213M1.397 6.90095C1.397 3.53039 4.12939 0.798003 7.49996 0.798004C10.8705 0.798004 13.6029 3.53039 13.6029 6.90096C13.6029 10.2715 10.8705 13.0039 7.49995 13.0039C4.12939 13.0039 1.397 10.2715 1.397 6.90095Z'
        );
        path.setAttribute('stroke', '#BF3232');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');

        iconSvg.appendChild(path);

        const textSpan = document.createElement('span');
        textSpan.textContent = 'Busy';
        textSpan.style.color = '#141414';
        textSpan.style.fontFamily = 'Inter, sans-serif';
        textSpan.style.fontSize = '13px';
        textSpan.style.fontWeight = '600';

        badgeContainer.appendChild(iconSvg);
        badgeContainer.appendChild(textSpan);

        const topCell = info.el.querySelector('.fc-daygrid-day-top');
        if (topCell) {
          info.el.style.position = 'relative';
          topCell.appendChild(badgeContainer);
        } else {
          info.el.style.position = 'relative';
          info.el.appendChild(badgeContainer);
        }
      }
    },
    [events]
  );

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
            font-weight: ${theme.fontWeights[600]};
          }
          .fc-day-today {
            background-color: inherit !important;
          }
          .fc-daygrid-day-number {
            margin-left: 6px;
            margin-top: 6px;
            font-size: ${theme.fontSizes.xs};
            font-weight: ${theme.fontWeights[400]};
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
          .fc-daygrid-day-events {
            padding-top: 18px !important;
            margin-top: 0 !important;
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
          .fc-daygrid-day-top {
            position: relative !important;
            z-index: 1;
          }
          
          .fc-daygrid-day-frame {
            position: relative !important;
          }
        `}
      />

      <Flex height="100vh">
        <CalendarSidebar
          setSearchQuery={setSearchQuery}
          onDeclareAbsenceClick={handleDeclareAbsenceClick}
          onDateSelect={handleDateSelect}
          selectDate={selectedDate}
        />
        <Box
          flex={1}
          paddingTop={theme.space[4]}
          height="100%"
          display="flex"
          flexDirection="column"
        >
          <CalendarHeader
            currentMonthYear={currentMonthYear}
            onTodayClick={handleTodayClick}
            onPrevClick={handlePrevClick}
            onNextClick={handleNextClick}
            userData={userData}
          />

          <Box flex={1} overflow="hidden" paddingRight={theme.space[2]}>
            <FullCalendar
              ref={calendarRef}
              headerToolbar={false}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="100%"
              events={filteredEvents}
              eventContent={renderEventContent}
              dayCellDidMount={dayCellDidMount}
              timeZone="local"
              datesSet={updateMonthYearTitle}
              fixedWeekCount={false}
              dayCellClassNames={({ date }) => addSquareClasses(date)}
              dateClick={handleDateClick}
            />
          </Box>
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
            Declare Absence
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <InputForm
              onClose={onClose}
              onAddAbsence={handleAddAbsence}
              initialDate={selectedDate!!}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Calendar;
