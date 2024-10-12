import { Box, Text } from '@chakra-ui/react';
import { Absence } from '../../types/absence';

interface DayViewProps {
  date: Date;
  absences: Absence[];
  onDelete: (id: number) => Promise<void>;
}

const DayView: React.FC<DayViewProps> = ({ date, absences, onDelete }) => {
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
            <Box
              as="div"
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
  );
};

export default DayView;
