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
import { EventInput, EventContentArg, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { Absence, Prisma } from '@prisma/client';
import { AbsenceAPI } from '@utils/types';
import { useUserData } from '@utils/useUserData';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import CalendarHeader from '../components/CalendarHeader';
import CalendarSidebar from '../components/CalendarSidebar';
import { CalendarTabs } from '../components/CalendarTabs';
import InputForm from '../components/InputForm';
import AbsenceDetails from '../components/AbsenceDetails';

const Calendar: React.FC = () => {
  const userData = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!userData.isLoading && !userData.isAuthenticated) {
      router.push('/');
    }
  }, [userData.isLoading, userData.isAuthenticated, router]);

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
  const [activeTab, setActiveTab] = React.useState<'explore' | 'declared'>(
    'explore'
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventInput | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const toast = useToast();
  const theme = useTheme();
  const {
    isOpen: isAbsenceDetailsOpen,
    onOpen: onAbsenceDetailsOpen,
    onClose: onAbsenceDetailsClose,
  } = useDisclosure();

  const {
    isOpen: isInputFormOpen,
    onOpen: onInputFormOpen,
    onClose: onInputFormClose,
  } = useDisclosure();

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
    absentTeacher: absenceData.absentTeacher,
    substituteTeacher: absenceData.substituteTeacher,
    subjectId: absenceData.subject.id,
    locationId: absenceData.location.id,
    absentTeacherFullName: `${absenceData.absentTeacher.firstName} ${absenceData.absentTeacher.lastName}`,
    roomNumber: absenceData.roomNumber || undefined,
    substituteTeacherFullName: absenceData.substituteTeacher
      ? `${absenceData.substituteTeacher.firstName} ${absenceData.substituteTeacher.lastName}`
      : undefined,
    lessonPlan: absenceData.lessonPlan,
    reasonOfAbsence: absenceData.reasonOfAbsence,
    notes: absenceData.notes,
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
    onInputFormOpen();
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

  const handleAbsenceClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      title: clickInfo.event.title || 'Untitled Event',
      start: clickInfo.event.start
        ? new Date(clickInfo.event.start).toISOString().split('T')[0]
        : 'Unknown',
      absentTeacher: clickInfo.event.extendedProps.absentTeacher || undefined,
      absentTeacherFullName:
        clickInfo.event.extendedProps.absentTeacherFullName || '',
      substituteTeacher:
        clickInfo.event.extendedProps.substituteTeacher || undefined,
      substituteTeacherFullName:
        clickInfo.event.extendedProps.substituteTeacherFullName || undefined,
      location: clickInfo.event.extendedProps.location || '',
      classType: clickInfo.event.extendedProps.classType || '',
      lessonPlan: clickInfo.event.extendedProps.lessonPlan || null,
      roomNumber: clickInfo.event.extendedProps.roomNumber || '',
      reasonOfAbsence: clickInfo.event.extendedProps.reasonOfAbsence || '',
      notes: clickInfo.event.extendedProps.notes || '',
    });
    onAbsenceDetailsOpen();
  };

  const handleDeclareAbsenceClick = () => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const today = calendarApi.getDate();
      setSelectedDate(today);
      onInputFormOpen();
    }
  };
  useEffect(() => {
    const { subjectIds, locationIds } = searchQuery;

    let filtered = events.filter((event) => {
      const subjectIdMatch = subjectIds.includes(event.subjectId);
      const locationIdMatch = locationIds.includes(event.locationId);
      return subjectIdMatch && locationIdMatch;
    });

    if (!isAdminMode) {
      if (activeTab === 'explore') {
        filtered = filtered.filter(
          (event) =>
            event.absentTeacher.id !== userData.id && !event.substituteTeacher
        );
      } else if (activeTab === 'declared') {
        filtered = filtered.filter(
          (event) =>
            event.absentTeacher.id === userData.id ||
            event.substituteTeacher?.id === userData.id
        );
      }
    }

    setFilteredEvents(filtered);
  }, [searchQuery, events, activeTab, userData.id, isAdminMode]);

  if (userData.isLoading) {
    return null;
  }

  if (!userData.isAuthenticated) {
    return null;
  }
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
            isAdminMode={isAdminMode}
            setIsAdminMode={setIsAdminMode}
          />

          <Box flex={1} overflow="hidden" pr={theme.space[2]}>
            {!isAdminMode && (
              <CalendarTabs activeTab={activeTab} onTabChange={setActiveTab} />
            )}
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
              eventClick={handleAbsenceClick}
              dateClick={handleDateClick}
            />
          </Box>
        </Box>
      </Flex>

      <AbsenceDetails
        isOpen={isAbsenceDetailsOpen}
        onClose={onAbsenceDetailsClose}
        event={selectedEvent}
      />

      <Modal isOpen={isInputFormOpen} onClose={onInputFormClose} isCentered>
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
              onClose={onInputFormClose}
              onAddAbsence={handleAddAbsence}
              initialDate={selectedDate!!}
              userId={userData.id}
              onTabChange={setActiveTab}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Calendar;
