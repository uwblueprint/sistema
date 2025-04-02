import {
  Badge,
  Box,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
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
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AbsenceBox from '../components/AbsenceBox';
import AbsenceDetails from '../components/AbsenceDetails';
import CalendarHeader from '../components/CalendarHeader';
import CalendarSidebar from '../components/CalendarSidebar';
import { CalendarTabs } from '../components/CalendarTabs';
import InputForm from '../components/InputForm';

const Calendar: React.FC = () => {
  const userData = useUserData();
  const router = useRouter();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!userData.isLoading && !userData.isAuthenticated) {
      router.push('/');
    }
  }, [userData.isLoading, userData.isAuthenticated, router]);

  useEffect(() => {
    if (searchParams && searchParams.get('isAdminMode') === 'true') {
      setIsAdminMode(true);

      const newUrl = window.location.href.split('?')[0];
      window.history.replaceState({}, '', newUrl);
    } else {
      setIsAdminMode(false);
    }
  }, [searchParams]);

  const { events, fetchAbsences } = useAbsences();
  const [claimedDays, setClaimedDays] = useState<Set<string>>(new Set());

  const calendarRef = useRef<FullCalendar>(null);
  const [filteredEvents, setFilteredEvents] = useState<EventInput[]>([]);
  const [searchQuery, setSearchQuery] = useState<{
    activeAbsenceStatusIds: number[];
    activeSubjectIds: number[];
    activeLocationIds: number[];
    archivedSubjectIds: number[];
    archivedLocationIds: number[];
  }>({
    activeAbsenceStatusIds: [],
    activeSubjectIds: [],
    activeLocationIds: [],
    archivedSubjectIds: [],
    archivedLocationIds: [],
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
    (eventInfo: EventContentArg) => {
      const {
        absentTeacher,
        absentTeacherDisplayName,
        substituteTeacherDisplayName,
        colors,
        locationAbbreviation,
        subjectAbbreviation,
        lessonPlan,
      } = eventInfo.event.extendedProps;

      const eventDate = new Date(eventInfo.event.startStr);
      const isPastEvent = eventDate < new Date();
      const opacity = isPastEvent ? 0.7 : 1;
      const createdByUser = absentTeacher.id === userData?.id;

      const highlightText = createdByUser
        ? substituteTeacherDisplayName
          ? `${absentTeacherDisplayName} -> ${substituteTeacherDisplayName}`
          : `${absentTeacherDisplayName} -> Unfilled`
        : undefined;

      return (
        <AbsenceBox
          title={subjectAbbreviation}
          location={locationAbbreviation}
          backgroundColor={
            substituteTeacherDisplayName || !createdByUser
              ? colors.light
              : 'white'
          }
          borderColor={createdByUser ? colors.dark : 'transparent'}
          textColor={colors.text}
          highlightText={highlightText}
          highlightColor={colors.medium}
          lessonPlan={lessonPlan}
          opacity={opacity}
        />
      );
    },
    [userData?.id]
  );

  useEffect(() => {
    const claimedAbsences = new Set<string>();

    events.forEach((event) => {
      if (event.start) {
        let eventDate: Date;

        if (Array.isArray(event.start)) {
          eventDate = new Date(event.start[0], event.start[1], event.start[2]);
        } else {
          eventDate = new Date(event.start);
        }

        const eventDateString = `${eventDate.getFullYear()}-${(eventDate.getMonth() + 1).toString().padStart(2, '0')}-${eventDate.getDate().toString().padStart(2, '0')}`;

        if (event.substituteTeacher?.id === userData?.id) {
          claimedAbsences.add(eventDateString);
        }
      }
    });

    setClaimedDays(claimedAbsences);
  }, [events, userData?.id]);

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
      lessonPlan: clickInfo.event.extendedProps.lessonPlan || null,
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
    const {
      activeAbsenceStatusIds,
      activeSubjectIds,
      activeLocationIds,
      archivedSubjectIds,
      archivedLocationIds,
    } = searchQuery;

    let filtered = events.filter((event) => {
      const subjectMatch =
        activeSubjectIds.includes(event.subjectId) ||
        archivedSubjectIds.includes(event.subjectId);

      const locationMatch =
        activeLocationIds.includes(event.locationId) ||
        archivedLocationIds.includes(event.locationId);

      const hasSubstitute = event.substituteTeacher != null;
      const eventAbsenceStatus = hasSubstitute ? 1 : 0;
      const AbsenceStatusMatch =
        activeAbsenceStatusIds.includes(eventAbsenceStatus);

      return subjectMatch && locationMatch && AbsenceStatusMatch;
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

  const handleAbsenceChange = async () => {
    await fetchAbsences();
  };

  if (userData.isLoading) {
    return null;
  }

  if (!userData.isAuthenticated) {
    return null;
  }

  const dayCellContent = (args) => {
    const eventDateString = `${args.date.getFullYear()}-${(args.date.getMonth() + 1).toString().padStart(2, '0')}-${args.date.getDate().toString().padStart(2, '0')}`;

    const isToday = (() => {
      const today = new Date();
      return (
        args.date.getFullYear() === today.getFullYear() &&
        args.date.getMonth() === today.getMonth() &&
        args.date.getDate() === today.getDate()
      );
    })();

    const isSelected =
      selectedDate &&
      args.date.getFullYear() === selectedDate.getFullYear() &&
      args.date.getMonth() === selectedDate.getMonth() &&
      args.date.getDate() === selectedDate.getDate();

    return (
      <Box
        position="relative"
        width="100%"
        height="100%"
        display="flex"
        alignItems="center"
        pt={1}
        pr={1}
      >
        <Box
          width="26px"
          height="26px"
          borderRadius="50%"
          backgroundColor={
            isToday
              ? 'primaryBlue.300'
              : isSelected
                ? 'primaryBlue.50'
                : 'transparent'
          }
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text
            textStyle="body"
            color={
              isToday ? 'white' : isSelected ? 'primaryBlue.300' : 'text.body'
            }
          >
            {args.date.getDate()}
          </Text>
        </Box>

        {!isAdminMode &&
          activeTab === 'explore' &&
          claimedDays.has(eventDateString) && (
            <Badge
              border="1px solid"
              borderColor="neutralGray.300"
              bg="transparent"
              color="neutralGray.900"
              padding="2px 4px"
              borderRadius="5px"
              textTransform="none"
              display="flex"
              alignItems="center"
              width="68px"
              marginLeft="auto"
              cursor="default"
            >
              <Image
                src="images/conflict.svg"
                alt="Conflict"
                boxSize="12px"
                mx={1}
              />
              <Text textStyle="semibold" isTruncated>
                Busy
              </Text>
            </Badge>
          )}
      </Box>
    );
  };

  return (
    <>
      <Global styles={getCalendarStyles} />
      <Flex height="100vh">
        <CalendarSidebar
          setSearchQuery={setSearchQuery}
          onDeclareAbsenceClick={handleDeclareAbsenceClick}
          onDateSelect={handleDateSelect}
          selectDate={selectedDate}
          isAdminMode={isAdminMode}
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
              dayCellContent={dayCellContent}
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
        onChange={handleAbsenceChange}
        isAdminMode={isAdminMode}
      />

      <Modal isOpen={isInputFormOpen} onClose={onInputFormClose} isCentered>
        <ModalOverlay />
        <ModalContent
          width={362}
          sx={{ padding: '33px 31px' }}
          borderRadius="16px"
        >
          <ModalHeader fontSize={22} p="0 0 28px 0">
            Declare Absence
          </ModalHeader>
          <ModalCloseButton top="33px" right="28px" color="text.header" />
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
