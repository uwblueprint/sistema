import { Box, Text } from '@chakra-ui/react';
import { Absence } from '../../types/absence';

interface WeekViewProps {
  date: Date;
  absences: Absence[];
  onDelete: (id: number) => Promise<void>;
}

const WeekView: React.FC<WeekViewProps> = ({ date, absences, onDelete }) => {
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
                <Box
                  as="button"
                  mt={2}
                  p={2}
                  borderWidth="1px"
                  borderRadius="md"
                  backgroundColor="red.500"
                  color="white"
                  onClick={() => onDelete(absence.id)}
                  _hover={{ backgroundColor: 'red.600' }}
                  _active={{ backgroundColor: 'red.700' }}
                >
                  Delete
                </Box>
              </Box>
            ))}
        </Box>
      ))}
    </Box>
  );
};

export default WeekView;
