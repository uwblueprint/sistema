import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Flex, useToast, useTheme } from '@chakra-ui/react';
import { EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { AbsenceWithRelations } from '../../app/api/getAbsences/route';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { Absence } from '@prisma/client';
import { FetchAbsenceResponse } from '../../types/absence';
import Sidebar from '../components/CalendarSidebar';
import CalendarHeader from '../components/CalendarHeader';
import { Global } from '@emotion/react';
import { Location } from '../../types/location';
import { Subject } from '../../types/subjects';

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
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [events, setEvents] = useState<EventInput[]>([]);
  const [currentMonthYear, setCurrentMonthYear] = useState('');
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const toast = useToast();
  const theme = useTheme();

  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<number[]>([]);

  // const convertAbsenceToEvent = (absenceData: Absence): EventInput => {
  //   const subjectColor =
  //     subjectProperties[absenceData.subject.name]?.color || '#000000'; // Fallback to black if no match

  //   return {
  //     title: absenceData.subject.name,
  //     start: absenceData.lessonDate,
  //     allDay: true,
  //     display: 'auto',
  //     location: absenceData.location.name,
  //     backgroundColor: subjectColor, // Use the reusable color map
  //     borderColor: subjectColor,
  //     extendedProps: {
  //       subjectId: absenceData.subjectId,
  //       locationId: absenceData.locationId,
  //     },
  //   };
  // };

  const convertAbsenceToEvent = (
    absenceData: AbsenceWithRelations
  ): EventInput => ({
    title: absenceData.subject.name,
    start: absenceData.lessonDate,
    allDay: true,
    display: 'auto',
    location: absenceData.location.name,
  });

  // const fetchAbsences = useCallback(async () => {
  //   try {
  //     const res = await fetch('/api/getAbsences/');
  //     if (!res.ok) {
  //       throw new Error(`Failed to fetch: ${res.statusText}`);
  //     }
  //     const data = await res.json();
  //     const formattedEvents = data.events.map(convertAbsenceToEvent);
  //     setEvents(formattedEvents);
  //   } catch (error) {
  //     console.error('Error fetching absences:', error);
  //     toast({
  //       title: 'Failed to fetch absences',
  //       description:
  //         'There was an error loading the absence data. Please try again later.',
  //       status: 'error',
  //       duration: 5000,
  //       isClosable: true,
  //     });
  //   }
  // }, [toast]);

  const handleSubjectChange = (subject: number, isSelected: boolean) => {
    setSelectedSubjects((prev) =>
      isSelected ? [...prev, subject] : prev.filter((s) => s !== subject)
    );
  };

  // Function to update selected locations
  const handleLocationChange = (location: number, isSelected: boolean) => {
    setSelectedLocations((prev) =>
      isSelected ? [...prev, location] : prev.filter((l) => l !== location)
    );
  };

  const filteredAbsences = absences.filter(
    (absence) =>
      (selectedSubjects.length === 0 ||
        selectedSubjects.includes(absence.subjectId)) &&
      (selectedLocations.length === 0 ||
        selectedLocations.includes(absence.locationId))
  );
  const filteredEvents = filteredAbsences.map((absence) =>
    convertAbsenceToEvent(absence)
  );

  const fetchAbsences = useCallback(async () => {
    try {
      // Fetch absences, locations, and subjects simultaneously
      const [absencesRes, locationsRes, subjectsRes] = await Promise.all([
        fetch('/api/absence'),
        fetch('/api/locations'),
        fetch('/api/subjects'),
      ]);

      if (absencesRes.ok && locationsRes.ok && subjectsRes.ok) {
        // Parse JSON responses
        const absencesData: FetchAbsenceResponse = await absencesRes.json();
        const locationsData = await locationsRes.json();
        const subjectsData = await subjectsRes.json();

        // Set absences with parsed dates
        setAbsences(
          absencesData.absences.map((absence) => ({
            ...absence,
            lessonDate: new Date(absence.lessonDate),
          }))
        );

        locationsData.locations.forEach((location: Location) => {
          handleLocationChange(location.id, true);
        });
        subjectsData.subjects.forEach((subject: Subject) => {
          handleSubjectChange(subject.id, true);
        });
      } else {
        throw new Error(`HTTP error! status: ${absencesRes.status}`);
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

  const addWeekendClass = (date: Date): string => {
    const day = date.getDay();
    return day === 0 || day === 6 ? 'fc-weekend' : '';
  };

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
        const scrollPosition = (totalDays / (4 * 365 + 1)) * totalHeight; //we love leap years
        containerElement.scrollTop = scrollPosition;
      }
    };

    // Wait for the calendar to render before scrolling
    setTimeout(scrollToCurrentMonth, 100);
  }, [updateCurrentMonth]);

  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const endDate = new Date();
  endDate.setFullYear(endDate.getFullYear() + 3);

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
        <Sidebar
          selectedSubjects={selectedSubjects}
          selectedLocations={selectedLocations}
          onSubjectChange={handleSubjectChange}
          onLocationChange={handleLocationChange}
        />
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

export default InfiniteScrollCalendar;
