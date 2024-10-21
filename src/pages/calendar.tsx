import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import 'react-calendar/dist/Calendar.css';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Select,
  Text,
  Flex,
} from '@chakra-ui/react';
import { Absence, FetchAbsenceResponse } from '../types/absence';
import InputForm from '../components/InputForm';
import TileContent from '../components/Calendar/TileContent';
import WeekView from '../components/Calendar/WeekView';
import DayView from '../components/Calendar/DayView';
import { CalendarStyles } from '../components/Calendar/CalendarStyles';

const Calendar = dynamic(() => import('react-calendar'), { ssr: false });

function CalendarView() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [value, setValue] = useState<Date | [Date, Date] | null>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formDate, setFormDate] = useState<Date | null>(null);
  const [view, setView] = useState('month');

  const fetchAbsences = useCallback(async () => {
    const res = await fetch('/api/absence');
    const data: FetchAbsenceResponse = await res.json();
    setAbsences(
      data.absences.map((absence) => ({
        ...absence,
        lessonDate: new Date(absence.lessonDate),
      }))
    );
  }, []);

  useEffect(() => {
    fetchAbsences();
  }, [fetchAbsences]);

  const onAddButtonClick = (date: Date) => {
    setFormDate(date);
    setIsFormOpen(true);
  };

  const handleAbsenceDelete = async (id: number) => {
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

  const addAbsence = async (absence: Absence): Promise<Absence | null> => {
    try {
      const response = await fetch('/api/absence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(absence),
      });

      if (response.ok) {
        const newAbsence = await response.json();
        const addedAbsence = {
          ...newAbsence.newAbsence,
          lessonDate: new Date(newAbsence.newAbsence.lessonDate),
        };
        setAbsences([...absences, addedAbsence]);
        setIsFormOpen(false);
        return addedAbsence;
      } else {
        const errorResponse = await response.json();
        console.error('Error response:', response.status, errorResponse);
        return null;
      }
    } catch (error) {
      console.error('Error adding absence:', error);
      return null;
    }
  };

  const onDelete = async (id: number) => {
    try {
      await handleAbsenceDelete(id);
      setAbsences((prevAbsences) =>
        prevAbsences.filter((absence) => absence.id !== id)
      );
    } catch (error) {
      console.error('Failed to delete absence:', error);
    }
  };

  const handleDateChange = (newValue: Date | [Date, Date]) => {
    if (newValue) {
      setValue(newValue);
    }
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
              onChange={handleDateChange}
              value={value}
              tileContent={(props) => (
                <TileContent
                  {...props}
                  absences={absences}
                  onAddButtonClick={onAddButtonClick}
                  onDelete={onDelete}
                />
              )}
              tileClassName="calendar-tile"
              className="react-calendar"
              showNeighboringMonth={false}
            />
          </Box>
        );
      case 'week':
        return (
          <WeekView
            date={value instanceof Date ? value : new Date()}
            absences={absences}
            onDelete={onDelete}
          />
        );
      case 'day':
        return (
          <DayView
            date={value instanceof Date ? value : new Date()}
            absences={absences}
            onDelete={onDelete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box p={5} height="100vh" display="flex" flexDirection="column">
      <CalendarStyles />
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
                onAddAbsence={addAbsence}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}

export default CalendarView;
