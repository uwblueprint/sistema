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

interface Absence {
  id: number;
  title: string;
  lessonDate: Date;
  lessonPlan: string | null;
  reasonOfAbsence: string;
  absentTeacherId: number;
  substituteTeacherId: number | null;
  subjectId: number,
  locationId: number;
  newAbsence?: Omit<Absence, 'id'>;
}

interface FetchAbsenceResponse {
  absences: Absence[];
}

function CalendarView() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [value, setValue] = useState<Value>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [view, setView] = useState('month');

  useEffect(() => {
    FetchAbsences();
  }, []);

  const FetchAbsences = async () => {
    const res = await fetch('/api/absence');
    const data: FetchAbsenceResponse = await res.json();
    setAbsences(
      data.absences.map((absence) => ({
        ...absence,
        lessonDate: new Date(absence.lessonDate),
      }))
    );
  };

  const TileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayAbsence = absences.filter(
        (absence) => absence.lessonDate.toDateString() === date.toDateString()
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
            {dayAbsence.map((absence, index) => (
              <Box
                key={absence.id || index}
                bg="blue.100"
                p={1}
                borderRadius="sm"
                boxShadow="sm"
                _hover={{ bg: 'blue.200', cursor: 'pointer' }}
              >
                <Button
                  size="xs"
                  colorScheme="red"
                  mt={1}
                  onClick={(e) => {
                    e.stopPropagation();
                    HandleAbsenceDelete(absence.id);
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

  const HandleAbsenceDelete = async (id: number) => {
    try {
      const response = await fetch('/api/absence', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      if (response.ok) {
        setAbsences((prevAbsences) =>
          prevAbsences.filter((absence) => absence.id !== id)
        );
      } else {
        console.error(
          'Failed to delete absence with id ${id}. Status: ${response.status}'
        );
      }
    } catch (error) {
      console.error('Error deleting absence:', error);
    }
  };

  const AddAbsence = async (absence: Absence) => {
    const response = await fetch('/api/absence', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(absence),
    });

    if (response.ok) {
      const newAbsence = await response.json();
      setAbsences([
        ...absences,
        {
          ... newAbsence.newAbsence,
          lessonDate: new Date(newAbsence.newAbsence.lessonDate),
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
            {absences
              .filter(
                (absence) =>
                  absence.lessonDate.toDateString() === day.toDateString()
              )
              .map((absence, index) => (
                <Box key={index}>
                  <Text>Reason of Absence: {absence.reasonOfAbsence}</Text>
                  <Button
                    size="sm"
                    colorScheme="red"
                    onClick={() => HandleAbsenceDelete(absence.id)}
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
        {absences
          .filter(
            (absence) => absence.lessonDate.toDateString() === date.toDateString()
          )
          .map((absence, index) => (
            <Box key={index} p={4} borderWidth="1px" borderRadius="lg" mb={4}>
              <Text>Reason of Absence: {absence.reasonOfAbsence}</Text>
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => HandleAbsenceDelete(absence.id)}
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
            <ModalHeader>Add Absence</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <InputForm
                initialDate={formDate}
                onClose={() => setIsFormOpen(false)}
                onAddAbsence={AddAbsence}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

export default CalendarView;
