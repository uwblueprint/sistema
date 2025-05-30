import {
  Badge,
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Image,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { useAbsences } from '@hooks/useAbsences';
import { useUserData } from '@hooks/useUserData';
import { formatMonthYear } from '@utils/dates';
import { getCalendarStyles } from '@utils/getCalendarStyles';
import { getDayCellClassNames } from '@utils/getDayCellClassNames';
import { EventDetails } from '@utils/types';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import AbsenceBox from '../components/absences/AbsenceBox';
import AbsenceDetails from '../components/absences/details/AbsenceDetails';
import DeclareAbsenceModal from '../components/absences/modals/declare/DeclareAbsenceModal';
import { CalendarTabs } from '../components/calendar/CalendarTabs';
import CalendarSidebar from '../components/calendar/sidebar/CalendarSidebar';
import CalendarHeader from '../components/header/calendar/CalendarHeader';

const Calendar: React.FC = () => {
  const { refetchUserData, ...userData } = useUserData();
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

  const { events, fetchAbsences } = useAbsences(refetchUserData);
  const [filledDays, setFilledDays] = useState<Set<string>>(new Set());

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
  const [activeTab, setActiveTab] = useState<'explore' | 'declared'>('explore');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isAbsenceDetailsOpen,
    onOpen: onAbsenceDetailsOpen,
    onClose: onAbsenceDetailsClose,
  } = useDisclosure();

  const handleAbsenceDetailsClose = () => {
    setSelectedEvent(null);
    onAbsenceDetailsClose();
  };

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
        substituteTeacher,
        substituteTeacherDisplayName,
        colors,
        locationAbbreviation,
        subjectAbbreviation,
        lessonPlan,
        absenceId,
      } = eventInfo.event.extendedProps;
      const subjectName = eventInfo.event.title;

      const eventDate = new Date(eventInfo.event.start!!);
      const now = new Date();
      const isSameDay =
        eventDate.getFullYear() === now.getFullYear() &&
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getDate() === now.getDate();
      const isPastEvent = eventDate < now && !isSameDay;

      const opacity = isPastEvent ? 0.6 : 1;
      const createdByUser = absentTeacher.id === userData?.id;
      const filledByUser = substituteTeacher?.id == userData?.id;
      const userRelatedOrIsAdminMode =
        createdByUser || isAdminMode || filledByUser;

      const highlightText = userRelatedOrIsAdminMode
        ? substituteTeacherDisplayName
          ? `${absentTeacherDisplayName} -> ${substituteTeacherDisplayName}`
          : `${absentTeacherDisplayName} -> Unfilled`
        : undefined;

      const isSelected = selectedEvent?.absenceId === absenceId;

      return (
        <AbsenceBox
          title={subjectName}
          abbreviation={subjectAbbreviation}
          location={locationAbbreviation}
          backgroundColor={
            substituteTeacherDisplayName || !userRelatedOrIsAdminMode
              ? colors.light
              : 'white'
          }
          borderColor={userRelatedOrIsAdminMode ? colors.dark : 'transparent'}
          textColor={colors.text}
          highlightText={highlightText}
          highlightColor={colors.medium}
          lessonPlan={lessonPlan}
          opacity={opacity}
          isSelected={isSelected}
        />
      );
    },
    [userData?.id, isAdminMode, selectedEvent]
  );

  useEffect(() => {
    const filledAbsences = new Set<string>();

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
          filledAbsences.add(eventDateString);
        }
      }
    });

    setFilledDays(filledAbsences);
  }, [events, userData?.id]);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  const isMobile = useBreakpointValue({ base: true, md: false, lg: false });

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

  const formatDateForFilledDays = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hasConflictingEvent = (event: EventDetails) => {
    if (!event?.start) return false;
    const dateString = formatDateForFilledDays(new Date(event.start));
    return filledDays.has(dateString);
  };

  const handleAbsenceClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start!!,
      absentTeacher: clickInfo.event.extendedProps.absentTeacher,
      absentTeacherFullName:
        clickInfo.event.extendedProps.absentTeacherFullName,
      substituteTeacher:
        clickInfo.event.extendedProps.substituteTeacher || null,
      substituteTeacherFullName:
        clickInfo.event.extendedProps.substituteTeacherFullName || '',
      location: clickInfo.event.extendedProps.location,
      locationId: clickInfo.event.extendedProps.locationId,
      subjectId: clickInfo.event.extendedProps.subjectId,
      lessonPlan: clickInfo.event.extendedProps.lessonPlan || null,
      roomNumber: clickInfo.event.extendedProps.roomNumber || '',
      reasonOfAbsence: clickInfo.event.extendedProps.reasonOfAbsence,
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

      let absenceStatusMatch = true;
      if (isAdminMode) {
        const hasSubstitute = event.substituteTeacher != null;
        const eventAbsenceStatus = hasSubstitute ? 1 : 0;
        absenceStatusMatch =
          activeAbsenceStatusIds.includes(eventAbsenceStatus);
      }

      return subjectMatch && locationMatch && absenceStatusMatch;
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
      <>
        <Box
          position="relative"
          width="100%"
          height="100%"
          display="flex"
          alignItems="center"
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
            filledDays.has(eventDateString) && (
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
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Calendar</title>
      </Head>
      <Global styles={getCalendarStyles} />
      <Flex height="100vh" width="100vw" overflow="hidden">
        <Box
          display={{ base: 'none', md: 'block' }}
          width="265px"
          flexShrink={0}
        >
          <CalendarSidebar
            setSearchQuery={setSearchQuery}
            onDeclareAbsenceClick={handleDeclareAbsenceClick}
            onDateSelect={handleDateSelect}
            selectDate={selectedDate}
            isAdminMode={isAdminMode}
          />
        </Box>
        <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent maxWidth="265px">
            <DrawerBody p={0}>
              <CalendarSidebar
                setSearchQuery={setSearchQuery}
                onDeclareAbsenceClick={handleDeclareAbsenceClick}
                onDateSelect={handleDateSelect}
                selectDate={selectedDate}
                isAdminMode={isAdminMode}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
        <Flex flex={1} direction="column" minW="0" overflow="hidden" pt={4}>
          <Box flexShrink={0}>
            <CalendarHeader
              currentMonthYear={currentMonthYear}
              onTodayClick={handleTodayClick}
              onPrevClick={handlePrevClick}
              onNextClick={handleNextClick}
              userData={userData}
              isAdminMode={isAdminMode}
              setIsAdminMode={setIsAdminMode}
              onToggleSidebar={onOpen}
            />
          </Box>
          <Box
            pr={isMobile ? 4 : 4}
            pl={isMobile ? 4 : 0}
            position="relative"
            flex={1}
            minH={0}
            minW={0}
            overflow="hidden"
          >
            {!isAdminMode && (
              <CalendarTabs activeTab={activeTab} onTabChange={setActiveTab} />
            )}
            <FullCalendar
              ref={calendarRef}
              headerToolbar={false}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView={isMobile ? 'dayGridDay' : 'dayGridMonth'}
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
              windowResize={() => {
                const newView = isMobile ? 'dayGridDay' : 'dayGridMonth';
                calendarRef.current?.getApi().changeView(newView);
              }}
            />
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height="50px"
              pointerEvents="none"
              background="linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)"
              zIndex={1}
            />
          </Box>
        </Flex>
      </Flex>
      <AbsenceDetails
        isOpen={isAbsenceDetailsOpen}
        onClose={handleAbsenceDetailsClose}
        event={selectedEvent!!}
        fetchAbsences={fetchAbsences}
        onDelete={handleDeleteAbsence}
        onTabChange={setActiveTab}
        isAdminMode={isAdminMode}
        hasConflictingEvent={hasConflictingEvent(selectedEvent!!)}
      />
      <DeclareAbsenceModal
        isOpen={isInputFormOpen}
        onClose={onInputFormClose}
        initialDate={selectedDate!!}
        userId={userData.id}
        onTabChange={setActiveTab}
        isAdminMode={isAdminMode}
        fetchAbsences={fetchAbsences}
      />
    </>
  );
};

export default Calendar;
