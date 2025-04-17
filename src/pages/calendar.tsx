import {
  Badge,
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useTheme,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  useToast,
} from '@chakra-ui/react';
import { Global } from '@emotion/react';
import { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import { useAbsences } from '@hooks/useAbsences';
import { useUserData } from '@hooks/useUserData';
import { formatMonthYear } from '@utils/formatMonthYear';
import { getCalendarStyles } from '@utils/getCalendarStyles';
import { getDayCellClassNames } from '@utils/getDayCellClassNames';
import { EventDetails } from '@utils/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import AbsenceBox from '../components/absences/AbsenceBox';
import AbsenceDetails from '../components/absences/details/AbsenceDetails';
import { CalendarTabs } from '../components/calendar/CalendarTabs';
import DeclareAbsenceForm from '../components/absences/modals/declare/DeclareAbsenceForm';
import AbsenceFillThanks from '../components/absences/details/AbsenceFillThanks';
import EditAbsenceForm from '../components/absences/modals/edit/EditAbsenceForm';
import ConfirmDeleteModal from '../components/absences/modals/delete/ConfirmDeleteModal';
import CalendarSidebar from '../components/calendar/sidebar/CalendarSidebar';
import CalendarHeader from '../components/header/calendar/CalendarHeader';

const Calendar: React.FC = () => {
  const { refetchUserData, ...userData } = useUserData();
  const router = useRouter();

  const searchParams = useSearchParams();

  const getOrdinalNum = (number: number) => {
    let selector;

    if (number <= 0) {
      selector = 4;
    } else if ((number > 3 && number < 21) || number % 10 > 3) {
      selector = 0;
    } else {
      selector = number % 10;
    }

    return number + ['th', 'st', 'nd', 'rd', ''][selector];
  };

  const formatDate = (date: Date) => {
    const parsedDate = new Date(date);
    const weekday = parsedDate.toLocaleDateString('en-CA', { weekday: 'long' });
    const month = parsedDate.toLocaleDateString('en-CA', { month: 'long' });
    const day = parsedDate.getDate();

    return `${weekday}, ${month} ${getOrdinalNum(day)}`;
  };

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
  const [clickedEventId, setClickedEventId] = useState<string | null>(null);
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

  const [isClosingDetails, setIsClosingDetails] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [isFillDialogOpen, setIsFillDialogOpen] = useState(false);
  const [isFillThanksOpen, setIsFillThanksOpen] = useState(false);
  const toast = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [absenceToDelete, setAbsenceToDelete] = useState<number | null>(null);

  const handleDeleteClick = (absenceId: number) => {
    setAbsenceToDelete(absenceId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setAbsenceToDelete(null);
  };

  const handleDeleteAbsence = async () => {
    await fetchAbsences();
  };

  const handleFillThanksDone = () => {
    setIsFillThanksOpen(false);
  };

  const handleFillAbsenceClick = () => {
    setIsFillDialogOpen(true);
  };

  const handleFillCancel = () => {
    setIsFillDialogOpen(false);
  };

  const handleFillConfirm = async () => {
    if (!selectedEvent) return;

    setIsFilling(true);

    try {
      const response = await fetch('/api/editAbsence', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedEvent.absenceId,
          lessonDate: selectedEvent.start,
          reasonOfAbsence: selectedEvent.reasonOfAbsence,
          notes: selectedEvent.notes,
          absentTeacherId: selectedEvent.absentTeacher.id,
          substituteTeacherId: userData.id,
          locationId: selectedEvent.locationId,
          subjectId: selectedEvent.subjectId,
          roomNumber: selectedEvent.roomNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fill absence');
      }

      toast({
        title: 'Absence filled',
        description: 'You have successfully filled this absence.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      await fetchAbsences();
      setIsFillDialogOpen(false);
      setIsFillThanksOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fill absence',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsFilling(false);
      handleCloseDetails();
    }
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseDetails = () => {
    setClickedEventId(null);
    onAbsenceDetailsClose();
    setIsClosingDetails(true);
    setTimeout(() => setIsClosingDetails(false), 100);
  };

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
        absenceId,
      } = eventInfo.event.extendedProps;

      const eventDate = new Date(eventInfo.event.start!!);
      const now = new Date();
      const isSameDay =
        eventDate.getFullYear() === now.getFullYear() &&
        eventDate.getMonth() === now.getMonth() &&
        eventDate.getDate() === now.getDate();
      const isPastEvent = eventDate < now && !isSameDay;

      const opacity = isPastEvent ? 0.6 : 1;
      const createdByUser = absentTeacher.id === userData?.id;

      const highlightText = createdByUser
        ? substituteTeacherDisplayName
          ? `${absentTeacherDisplayName} -> ${substituteTeacherDisplayName}`
          : `${absentTeacherDisplayName} -> Unfilled`
        : undefined;

      const eventDetails = {
        title: eventInfo.event.title,
        start: eventInfo.event.start!!,
        absentTeacher: eventInfo.event.extendedProps.absentTeacher,
        absentTeacherFullName:
          eventInfo.event.extendedProps.absentTeacherFullName,
        substituteTeacher:
          eventInfo.event.extendedProps.substituteTeacher || null,
        substituteTeacherFullName:
          eventInfo.event.extendedProps.substituteTeacherFullName || '',
        location: eventInfo.event.extendedProps.location,
        locationId: eventInfo.event.extendedProps.locationId,
        subjectId: eventInfo.event.extendedProps.subjectId,
        lessonPlan: eventInfo.event.extendedProps.lessonPlan || null,
        roomNumber: eventInfo.event.extendedProps.roomNumber || '',
        reasonOfAbsence: eventInfo.event.extendedProps.reasonOfAbsence,
        notes: eventInfo.event.extendedProps.notes || '',
        absenceId: eventInfo.event.extendedProps.absenceId,
      };

      const absenceBox = (
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

      const isCurrentEvent = absenceId === clickedEventId;

      // Use Popover component with Portal for proper positioning
      return (
        <Popover
          isOpen={isCurrentEvent && isAbsenceDetailsOpen}
          onClose={handleCloseDetails}
          placement="right-start"
          closeOnBlur={true}
          closeOnEsc={true}
          gutter={16}
        >
          <PopoverTrigger>
            <Box
              onClick={() => {
                setSelectedEvent(eventDetails);
                setClickedEventId(absenceId);
                onAbsenceDetailsOpen();
              }}
              display="inline-block"
              position="relative"
              width="100%"
              height="100%"
              cursor="pointer"
            >
              {absenceBox}
            </Box>
          </PopoverTrigger>
          {isCurrentEvent && (
            <Portal>
              <PopoverContent
                width="362px"
                borderRadius="15px"
                padding="30px"
                marginY={5}
                boxShadow="0px 0px 25px 0px rgba(0, 0, 0, 0.25)"
                zIndex={1500}
                _focus={{
                  boxShadow: '0px 0px 25px 0px rgba(0, 0, 0, 0.25)',
                  outline: 'none',
                }}
              >
                <PopoverBody p={0}>
                  <AbsenceDetails
                    event={eventDetails}
                    isAdminMode={isAdminMode}
                    onClose={handleCloseDetails}
                    onDelete={handleDeleteClick}
                    fetchAbsences={fetchAbsences}
                    onFillClick={handleFillAbsenceClick}
                    onEditClick={handleEditClick}
                  />
                </PopoverBody>
              </PopoverContent>
            </Portal>
          )}
        </Popover>
      );
    },
    [
      userData?.id,
      isAdminMode,
      isAbsenceDetailsOpen,
      onAbsenceDetailsOpen,
      clickedEventId,
      fetchAbsences,
      handleCloseDetails,
      handleDeleteClick,
      handleFillAbsenceClick,
      handleEditClick,
    ]
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

  const updateMonthYearTitle = useCallback(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const date = calendarApi.getDate();
      setCurrentMonthYear(formatMonthYear(date));
    }
  }, []);

  const handleDateClick = (arg: { date: Date }) => {
    if (!isClosingDetails) {
      setSelectedDate(arg.date);
      onInputFormOpen();
    }
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
    // Prevent default behavior so our custom handlers work
    clickInfo.jsEvent.preventDefault();
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
    );
  };

  return (
    <>
      <Global styles={getCalendarStyles} />
      <Flex height="100vh" overflow="hidden">
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
          overflow="hidden"
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

          <Box flex={1} overflow="auto" pr={theme.space[2]}>
            {!isAdminMode && (
              <CalendarTabs activeTab={activeTab} onTabChange={setActiveTab} />
            )}
            <FullCalendar
              ref={calendarRef}
              headerToolbar={false}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              height="auto"
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
            <DeclareAbsenceForm
              onClose={onInputFormClose}
              initialDate={selectedDate!!}
              userId={userData.id}
              onTabChange={setActiveTab}
              isAdminMode={isAdminMode}
              fetchAbsences={fetchAbsences}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={isFillDialogOpen} onClose={handleFillCancel} isCentered>
        <ModalOverlay />
        <ModalContent
          width="300px"
          padding="25px"
          sx={{
            alignItems: 'center',
          }}
        >
          <ModalHeader
            textStyle="h3"
            fontSize="16px"
            padding="0"
            textAlign="center"
          >
            Are you sure you want to fill this absence?
          </ModalHeader>
          <ModalBody
            textStyle="subtitle"
            color="text"
            padding="0"
            mt="12px"
            mb="16px"
          >
            <Text>{"You won't be able to undo."}</Text>
          </ModalBody>
          <ModalFooter padding="0">
            <Button
              onClick={handleFillCancel}
              variant="outline"
              textStyle="button"
              fontWeight="500"
              mr="10px"
            >
              Cancel
            </Button>
            <Button
              onClick={handleFillConfirm}
              textStyle="button"
              fontWeight="500"
              isLoading={isFilling}
              ml="10px"
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {selectedEvent && (
        <AbsenceFillThanks
          isOpen={isFillThanksOpen}
          onClose={handleFillThanksDone}
          event={selectedEvent}
          absenceDate={formatDate(selectedEvent.start)}
        />
      )}
      {selectedEvent && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          isCentered
        >
          <ModalOverlay />
          <ModalContent
            width={362}
            sx={{ padding: '33px 31px' }}
            borderRadius="16px"
          >
            <ModalHeader fontSize={22} p="0 0 28px 0">
              Edit Absence
            </ModalHeader>
            <ModalCloseButton top="33px" right="28px" color="text.header" />
            <ModalBody p={0}>
              <EditAbsenceForm
                initialData={selectedEvent}
                isAdminMode={isAdminMode}
                fetchAbsences={fetchAbsences}
                onClose={() => setIsEditModalOpen(false)}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
      {/* Delete Absence Modal */}
      {absenceToDelete && (
        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteModalClose}
          absenceId={absenceToDelete}
          onDelete={handleDeleteAbsence}
        />
      )}
    </>
  );
};

export default Calendar;
