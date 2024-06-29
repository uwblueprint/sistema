import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';
import {
  Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalCloseButton, ModalBody, Select, Text, VStack, Flex
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
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await fetch('/api/absence');
    const data: Event[] = await res.json();
    setEvents(data.absences.map(event => ({
      ...event,
      lessonDate: new Date(event.lessonDate),
    })));
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = events.filter(event => event.lessonDate.toDateString() === date.toDateString());
      return (
        <VStack spacing={1} p={1} align="start" height="100%" overflow="hidden">
          {dayEvents.map((event, index) => (
            <Box
              key={event.id || index}
              width="full"
              p={2}
              bg="blue.200"
              borderRadius="md"
              boxShadow="md"
              mb={1}
              _hover={{ bg: 'blue.300', cursor: 'pointer' }}
              fontSize="sm"
            >
              <Text isTruncated>{event.subject}</Text>
              <Button size="xs" colorScheme="red" onClick={() => handleEventDelete(event.id)} mt={1}>
                Delete
              </Button>
            </Box>
          ))}
          <Button size="xs" colorScheme="green" onClick={() => onAddButtonClick(date)}>
            +
          </Button>
        </VStack>
      );
    }
    return null;
  };

  const onAddButtonClick = (date: Date) => {
    setFormDate(date);
    setIsFormOpen(true);
  };

  const handleEventDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/absence`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
      } else {
        console.error(`Failed to delete event with id ${id}. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const addEvent = async (event: Event) => {
    const response = await fetch('/api/absence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      const newEvent = await response.json();
      setEvents([...events, { ...newEvent, lessonDate: new Date(newEvent.lessonDate) }]);
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
          <Box key={day.toDateString()} p={4} borderWidth="1px" borderRadius="lg" mb={4}>
            <Text as="h3">{day.toDateString()}</Text>
            {events
              .filter((event) => event.lessonDate.toDateString() === day.toDateString())
              .map((event, index) => (
                <Box key={index}>
                  <Text>Subject: {event.subject}</Text>
                  <Text>Reason of Absence: {event.reasonOfAbsence}</Text>
                  <Button size="sm" colorScheme="red" onClick={() => handleEventDelete(event.id)}>Delete</Button>
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
          .filter((event) => event.lessonDate.toDateString() === date.toDateString())
          .map((event, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="lg" mb={4}>
              <Text>Subject: {event.subject}</Text>
              <Text>Reason of Absence: {event.reasonOfAbsence}</Text>
              <Button size="sm" colorScheme="red" onClick={() => handleEventDelete(event.id)}>Delete</Button>
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
            height="calc(100vh - 80px)" 
            maxW="1200px" 
            mx="auto" 
            bg="#333333" 
            border="1px solid #555555" 
            borderRadius="8px" 
            color="#ffffff" 
            p={4}
            overflow="hidden"
          >
            <Calendar
              onChange={setValue}
              value={value}
              tileContent={tileContent}
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
            bg="#333333" 
            border="1px solid #555555" 
            borderRadius="8px" 
            color="#ffffff" 
            p={4}
            overflow="hidden"
          >
            <Calendar
              onChange={setValue}
              value={value}
              tileContent={tileContent}
              className="react-calendar"
              showNeighboringMonth={false}
            />
          </Box>
        );
    }
  };

  return (
    <Box p={5} height="100vh" display="flex" flexDirection="column">
      <Flex justifyContent="center" mb={4}>
        <Box>
          <Text as="label" mr={2}>
            View:
          </Text>
          <Select value={view} onChange={(e) => setView(e.target.value)} w="200px" display="inline-block">
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </Select>
        </Box>
        <Button ml={4} colorScheme="blue" size="lg" onClick={() => onAddButtonClick(new Date())}>Add Event</Button>
      </Flex>
      <Box bg="white" borderWidth="1px" borderRadius="lg" p={5} flex="1" overflow="auto">
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
                onAddEvent={addEvent}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

export default CalendarView;
