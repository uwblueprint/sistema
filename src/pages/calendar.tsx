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
import { EventClickArg, EventContentArg, EventInput } from '@fullcalendar/core';
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<AbsenceAPI | null>(
    null
  );
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
    id: String(absenceData.id),
    title: absenceData.subject.name,
    start: absenceData.lessonDate,
    allDay: true,
    display: 'auto',
    location: absenceData.location.name,
    extendedProps: {
      // Add other necessary properties here
      absenceId: absenceData.id,
      reasonOfAbsence: absenceData.reasonOfAbsence,
      absentTeacherId: absenceData.absentTeacherId,
      substituteTeacherId: absenceData.substituteTeacherId,
      subject: absenceData.subject.name,
      subjectId: absenceData.subject.id,
      locationId: absenceData.location.id,
      notes: absenceData.notes,
      lessonPlan: absenceData.lessonPlan,
      absentTeacherFirstName: absenceData.absentTeacher.firstName,
      absentTeacherLastName: absenceData.absentTeacher.lastName,
      substituteTeacher: absenceData.substituteTeacher,
    },
    subjectId: absenceData.subject.id,
    locationId: absenceData.location.id,
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

  const handleEditAbsence = async (
    absence: Prisma.AbsenceUpdateInput & { id: number }
  ): Promise<Absence | null> => {
    try {
      const res = await fetch('/api/editAbsence', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(absence),
      });

      if (!res.ok) {
        throw new Error(`Failed to edit absence: ${res.statusText}`);
      }

      const updatedAbsence = await res.json();
      await fetchAbsences(); // Refresh the calendar events
      return updatedAbsence;
    } catch (error) {
      console.error('Error editing absence:', error);
      toast({
        title: 'Failed to update absence',
        description:
          'There was an error updating the absence. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
    setIsEditMode(false);
    setSelectedAbsence(null);
    onOpen();
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    // Extract the existing absence details from the clicked event
    console.log(clickInfo.event);
    const absenceId = clickInfo.event.extendedProps.absenceId;

    if (!absenceId) {
      // If there's no ID, this isn't a real absence event that can be edited
      setIsEditMode(false);
      setSelectedAbsence(null);
      onOpen();
      return;
    }
    const existingAbsence: AbsenceAPI = {
      id: Number(clickInfo.event.id),
      lessonDate: new Date(clickInfo.event.startStr),
      subject: {
        id: clickInfo.event.extendedProps.subjectId,
        name: clickInfo.event.title,
        abbreviation: '',
        colorGroup: {
          colorCodes: [],
        },
      },
      location: {
        id: clickInfo.event.extendedProps.locationId,
        name: clickInfo.event.extendedProps.location,
      },
      reasonOfAbsence: clickInfo.event.extendedProps.reasonOfAbsence,
      absentTeacherId: clickInfo.event.extendedProps.absentTeacherId,
      substituteTeacherId: clickInfo.event.extendedProps.substituteTeacherId,
      absentTeacher: {
        firstName: clickInfo.event.extendedProps.absentTeacherFirstName,
        lastName: clickInfo.event.extendedProps.absentTeacherLastName,
      },
      notes: clickInfo.event.extendedProps.notes,
      lessonPlan: clickInfo.event.extendedProps.lessonPlan,
    };
    const hasExistingAbsenceData =
      existingAbsence.subject.name !== '' ||
      existingAbsence.location.name !== '';
    console.log(existingAbsence);
    setSelectedAbsence(existingAbsence);
    setIsEditMode(hasExistingAbsenceData);
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
      setIsEditMode(false);
      setSelectedAbsence(null);
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
            cursor: pointer;
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
              dateClick={handleDateClick}
              eventClick={handleEventClick}
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
            {isEditMode ? 'Edit Absence' : 'Declare Absence'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            <InputForm
              onClose={() => {
                onClose();
                setIsEditMode(false);
                setSelectedAbsence(null);
              }}
              onAddAbsence={handleAddAbsence}
              onEditAbsence={handleEditAbsence}
              initialDate={selectedDate || new Date()}
              initialAbsence={selectedAbsence}
              isEditMode={isEditMode}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Calendar;
