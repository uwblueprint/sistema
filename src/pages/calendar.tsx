import { Box, Flex, useTheme, useToast } from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { AbsenceAPI, mapColorCodes } from '@utils/types';
import useUserData from '@utils/useUserData';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CalendarHeader from '../components/CalendarHeader';
import Sidebar from '../components/CalendarSidebar';
import { FiPaperclip } from 'react-icons/fi';

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
  const userData = useUserData();

  const renderEventContent = useCallback((eventInfo: EventContentArg) => {
    const {
      absentTeacherFullName,
      absentTeacherDisplayName,
      substituteTeacherDisplayName,
      colors,
      location,
    } = eventInfo.event.extendedProps;

    const createdByUser = absentTeacherFullName === userData?.name;

    const highlightText = createdByUser
      ? substituteTeacherDisplayName
        ? `${absentTeacherDisplayName} -> ${substituteTeacherDisplayName}`
        : `${absentTeacherDisplayName} -> Unfilled`
      : null;

    // filled and not created by current user
    if (!createdByUser && substituteTeacherDisplayName) {
      return null;
    }

    return (
      <AbsenceBox
        title={eventInfo.event.title}
        location={location}
        backgroundColor={
          substituteTeacherDisplayName || !createdByUser
            ? colors.light
            : 'white'
        }
        borderColor={createdByUser ? colors.dark : 'transparent'}
        textColor={colors.text}
        highlightText={highlightText}
        highlightColor={colors.medium}
      />
    );
  }, []);

  const AbsenceBox = ({
    title,
    location,
    backgroundColor,
    borderColor,
    textColor,
    highlightText,
    highlightColor,
  }) => (
    <Box
      sx={{
        padding: (theme) => `${theme.space[1]} ${theme.space[1]}`,
        margin: (theme) => `${theme.space[2]} 0`,
        borderRadius: (theme) => `${theme.radii.md}`,
        backgroundColor,
        textColor,
        border: '0.1rem solid',
        borderLeft: '0.5rem solid',
        borderColor,
        position: 'relative',
      }}
    >
      <FiPaperclip
        style={{
          position: 'absolute',
          inset: '0 0 auto auto',
          margin: '0.5rem',
          color: textColor,
          transform: 'rotate(180deg)',
        }}
      />
      <Box className="fc-event-title-container">
        <Box className="fc-event-title fc-sticky" sx={{ fontWeight: 'bold' }}>
          {title}
        </Box>
      </Box>
      <Box className="fc-event-title fc-sticky" sx={{ fontSize: 'xs' }}>
        {location}
      </Box>
      {highlightText && (
        <Box
          sx={{
            width: 'fit-content',
            padding: (theme) => `${theme.space[1]} ${theme.space[1]}`,
            borderRadius: (theme) => `${theme.radii.md}`,
            backgroundColor: highlightColor,
            fontWeight: 'bold',
            fontSize: 'xs',
          }}
        >
          {highlightText}
        </Box>
      )}
    </Box>
  );

  const convertAbsenceToEvent = (absenceData: AbsenceAPI): EventInput => ({
    title: absenceData.subject.name,
    start: absenceData.lessonDate,
    allDay: true,
    display: 'auto',
    location: absenceData.location.name,
    subjectId: absenceData.subject.id,
    locationId: absenceData.location.id,
    colors: mapColorCodes(absenceData.subject.colorGroup.colorCodes),
    absentTeacherDisplayName: absenceData.absentTeacher.firstName,
    absentTeacherFullName: `${absenceData.absentTeacher.firstName} ${absenceData.absentTeacher.lastName}`,
    substituteTeacherDisplayName:
      absenceData.substituteTeacher?.firstName || undefined,
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
      console.log(formattedEvents);
      console.log(data);
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

  useEffect(() => {
    const { subjectIds, locationIds } = searchQuery;

    const filtered = events.filter((event) => {
      const subjectIdMatch = subjectIds.includes(event.subjectId);
      const locationIdMatch = locationIds.includes(event.locationId);
      return subjectIdMatch && locationIdMatch;
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
            border: 0px;
            background-color: transparent;
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
        <Sidebar
          setSearchQuery={setSearchQuery}
          onDateSelect={handleDateSelect}
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
              timeZone="local"
              datesSet={updateMonthYearTitle}
              fixedWeekCount={false}
              dayCellClassNames={({ date }) => addSquareClasses(date)}
            />
          </Box>
        </Box>
      </Flex>
    </>
  );
};

export default Calendar;
