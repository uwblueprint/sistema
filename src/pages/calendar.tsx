import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Select,
  Text,
  VStack,
  Flex,
} from '@chakra-ui/react';
import InputForm from '../components/InputForm';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface Event {
  id: number;
  title: string;
  lessonDate: Date;
  subject: string;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  locationId: number;
}

function CalendarView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [value, setValue] = useState<Value>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [view, setView] = useState('month');

  useEffect(() => {
    FetchEvents();
  }, []);

  const FetchEvents = async () => {
    const res = await fetch('/api/absence');
    const data: Event[] = await res.json();
    setEvents(
      data.absences.map((event) => ({
        ...event,
        lessonDate: new Date(event.lessonDate),
      }))
    );
  };

  const TileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = events.filter(
        (event) => event.lessonDate.toDateString() === date.toDateString()
      );
      return (
        <Box position="relative" height="100%" width="100%">
          <Button
            size="xs"
            colorScheme="green"
            onClick={() => onAddButtonClick(date)}
            position="absolute"
            top="2px"
            right="2px"
            zIndex="1"
            minW="20px"
            height="20px"
            p="0"
          >
            +
          </Button>
          <VStack
            spacing={1}
            pt="24px"
            pb="2px"
            px="2px"
            align="stretch"
            height="100%"
            width="100%"
            overflowY="auto"
          >
            {dayEvents.map((event, index) => (
              <Box
                key={event.id || index}
                bg="blue.100"
                p={1}
                borderRadius="sm"
                boxShadow="sm"
                _hover={{ bg: 'blue.200', cursor: 'pointer' }}
              >
                <Text fontSize="xs" fontWeight="bold" isTruncated>
                  {event.subject}
                </Text>
                <Button
                  size="xs"
                  colorScheme="red"
                  mt={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    HandleEventDelete(event.id);
                  }}
                >
                  Delete
                </Button>
              </Box>
            ))}
          </VStack>
        </Box>
      );
    }
    return null;
  };

  const onAddButtonClick = (date: Date) => {
    setFormDate(date);
    setIsFormOpen(true);
  };

  const HandleEventDelete = async (id: number) => {
    try {
      const response = await fetch('/api/absence', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== id)
        );
      } else {
        console.error(
          'Failed to delete event with id ${id}. Status: ${response.status}'
        );
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const AddEvent = async (event: Event) => {
    const response = await fetch('/api/absence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event.newAbsence),
    });

    if (response.ok) {
      const newEvent = await response.json();
      setEvents([
        ...events,
        {
          ...newEvent.newAbsence,
          lessonDate: new Date(newEvent.newAbsence.lessonDate),
        },
      ]);
    } else {
      const errorResponse = await response.json();
      console.error('Error response:', response.status, errorResponse);
    }
  };

  const renderWeekView = (date: Date) => {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
        {weekDays.map((day) => (
          <Box
            key={day.toDateString()}
            p={4}
            borderWidth="1px"
            borderRadius="lg"
            mb={4}
          >
            <Text as="h3">{day.toDateString()}</Text>
            {events
              .filter(
                (event) =>
                  event.lessonDate.toDateString() === day.toDateString()
              )
              .map((event, index) => (
                <Box key={index}>
                  <Text>Subject: {event.subject}</Text>
                  <Text>Reason of Absence: {event.reasonOfAbsence}</Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => HandleEventDelete(event.id)}
                  >
                    Delete
                  </Button>
                </Box>
              ))}
          </Box>
        ))}
      </Box>
    );
  };

  const renderDayView = (date: Date) => {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg">
        <Text as="h2">{date.toDateString()}</Text>
        {events
          .filter(
            (event) => event.lessonDate.toDateString() === date.toDateString()
          )
          .map((event, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="lg" mb={4}>
              <Text>Subject: {event.subject}</Text>
              <Text>Reason of Absence: {event.reasonOfAbsence}</Text>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => HandleEventDelete(event.id)}
              >
                Delete
              </Button>
            </Box>
          ))}
      </Box>
    );
  };

  const renderCalendar = () => {
    switch (view) {
      case 'month':
        return (
          <Box
            width="100%"
            height="calc(100vh - 100px)"
            maxW="1400px"
            mx="auto"
            bg="white"
            borderRadius="lg"
            boxShadow="xl"
            p={6}
            overflow="hidden"
          >
            <Calendar
              onChange={setValue}
              value={value}
              tileContent={TileContent}
              tileClassName="calendar-tile"
              className="react-calendar"
              showNeighboringMonth={false}
            />
          </Box>
        );
      case 'week':
        return renderWeekView(value as Date);
      case 'day':
        return renderDayView(value as Date);
      default:
        return (
          <Box
            width="100%"
            height="calc(100vh - 80px)"
            maxW="1200px"
            mx="auto"
            bg="#f0f0f0"
            border="1px solid #555555"
            borderRadius="8px"
            color="#000000"
            p={4}
            overflow="hidden"
          >
            <Calendar
              onChange={setValue}
              value={value}
              tileContent={TileContent}
              className="react-calendar"
              showNeighboringMonth={false}
            />
          </Box>
        );
    }
  };

  return (
    <Box p={5} height="100vh" display="flex" flexDirection="column">
      <style jsx global>{`
        .react-calendar {
          width: 100%;
          max-width: 100%;
          background: white;
          border: none;
          font-family: Arial, Helvetica, sans-serif;
          line-height: 1.125em;
        }
        .react-calendar__tile {
          max-width: 100%;
          padding: 0;
          background: none;
          text-align: center;
          line-height: 16px;
          font-size: 0.9em;
          height: 120px;
          position: relative;
        }
        .react-calendar__month-view__days__day {
          color: #1a202c;
        }
        .react-calendar__navigation button {
          min-width: 44px;
          background: none;
          font-size: 1.2em;
          margin-top: 8px;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.75em;
          font-size: 1em;
          font-weight: bold;
          text-decoration: none;
          color: #4a5568;
        }
        .react-calendar__tile > abbr {
          position: absolute;
          top: 4px;
          left: 4px;
          z-index: 1;
        }
      `}</style>
      <Flex justifyContent="center" mb={6}>
        <Box>
          <Text as="label" mr={3} fontSize="lg" fontWeight="medium">
            View:
          </Text>
          <Select
            value={view}
            onChange={(e) => setView(e.target.value)}
            w="200px"
            display="inline-block"
            size="lg"
            borderColor="gray.300"
            _hover={{ borderColor: 'gray.400' }}
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </Select>
        </Box>
      </Flex>
      <Box
        bg="white"
        borderWidth="1px"
        borderRadius="lg"
        p={5}
        flex="1"
        overflow="auto"
      >
        {renderCalendar()}
      </Box>
      {isFormOpen && formDate && (
        <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Event</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <InputForm
                initialDate={formDate}
                onClose={() => setIsFormOpen(false)}
                onAddEvent={AddEvent}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

export default CalendarView;
