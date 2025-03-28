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
} from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { useAbsences } from '@hooks/useAbsences';
import { useUserData } from '@hooks/useUserData';
import { Absence, Prisma } from '@prisma/client';
import { formatMonthYear } from '@utils/formatMonthYear';
import { getCalendarStyles } from '@utils/getCalendarStyles';
import { getDayCellClassNames } from '@utils/getDayCellClassNames';
import { EventDetails } from '@utils/types';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AbsenceDetails from '../components/AbsenceDetails';
import CalendarHeader from '../components/CalendarHeader';
import CalendarSidebar from '../components/CalendarSidebar';
import { CalendarTabs } from '../components/CalendarTabs';
import InputForm from '../components/InputForm';

const Calendar: React.FC = () => {
  const userData = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!userData.isLoading && !userData.isAuthenticated) {
      router.push('/');
    }
  }, [userData.isLoading, userData.isAuthenticated, router]);

  const { events, fetchAbsences } = useAbsences();

  const calendarRef = useRef<FullCalendar>(null);
  const [filteredEvents, setFilteredEvents] = useState<EventInput[]>([]);
  const [searchQuery, setSearchQuery] = useState<{
    subjectIds: number[];
    locationIds: number[];
    archiveIds: number[];
  }>({
    subjectIds: [],
    locationIds: [],
    archiveIds: [],
  });
  const [currentMonthYear, setCurrentMonthYear] = useState(
    formatMonthYear(new Date())
  );
  const [activeTab, setActiveTab] = React.useState<'explore' | 'declared'>(
    'explore'
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
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

  const handleDeclareAbsence = async (
    absence: Prisma.AbsenceCreateManyInput
  ): Promise<Absence | null> => {
    try {
      const res = await fetch('/api/declareAbsence', {
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

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

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

  const handleAbsenceClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      title: clickInfo.event.title || 'Untitled Event',
      start: clickInfo.event.start,
      absentTeacher: clickInfo.event.extendedProps.absentTeacher || null,
      absentTeacherFullName:
        clickInfo.event.extendedProps.absentTeacherFullName || '',
      substituteTeacher:
        clickInfo.event.extendedProps.substituteTeacher || null,
      substituteTeacherFullName:
        clickInfo.event.extendedProps.substituteTeacherFullName || '',
      location: clickInfo.event.extendedProps.location || '',
      classType: clickInfo.event.extendedProps.classType || '',
      lessonPlan: clickInfo.event.extendedProps.lessonPlan || '',
      roomNumber: clickInfo.event.extendedProps.roomNumber || '',
      reasonOfAbsence: clickInfo.event.extendedProps.reasonOfAbsence || '',
      notes: clickInfo.event.extendedProps.notes || '',
      absenceId: clickInfo.event.extendedProps.absenceId,
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
    const { subjectIds, locationIds, archiveIds } = searchQuery;

    let filtered = events.filter((event) => {
      const subjectMatch = subjectIds.includes(event.subjectId);

      const locationMatch = locationIds.includes(event.locationId);

      let archiveMatch = true;

      if (archiveIds.length === 0) {
        archiveMatch = !event.archivedSubject && !event.archivedLocation;
      } else {
        const includeArchivedSubjects = archiveIds.includes(0);
        const includeArchivedLocations = archiveIds.includes(1);

        const subjectArchiveMatch =
          includeArchivedSubjects || !event.archivedSubject;
        const locationArchiveMatch =
          includeArchivedLocations || !event.archivedLocation;

        archiveMatch = subjectArchiveMatch && locationArchiveMatch;
      }

      return subjectMatch && locationMatch && archiveMatch;
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

  const handleDeleteAbsence = async () => {
    await fetchAbsences();
  };

  if (userData.isLoading) {
    return null;
  }

  if (!userData.isAuthenticated) {
    return null;
  }
  return (
    <>
      <Global styles={getCalendarStyles} />

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
              dayCellClassNames={({ date }) =>
                getDayCellClassNames(date, selectedDate)
              }
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
        onDelete={handleDeleteAbsence}
        isAdminMode={isAdminMode}
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
              onDeclareAbsence={handleDeclareAbsence}
              initialDate={selectedDate!!}
              userId={userData.id}
              onTabChange={setActiveTab}
              isAdminMode={isAdminMode}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Calendar;
