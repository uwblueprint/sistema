import { Box, VStack } from '@chakra-ui/react';
import { Absence } from '../../types/absence';

interface TileContentProps {
  date: Date;
  view: string;
  absences: Absence[];
  onAddButtonClick: (date: Date) => void;
  onDelete: (id: number) => Promise<void>;
}

const TileContent: React.FC<TileContentProps> = ({
  date,
  view,
  absences,
  onAddButtonClick,
  onDelete,
}) => {
  if (view !== 'month') return null;

  const dayAbsences = absences.filter(
    (absence) => absence.lessonDate.toDateString() === date.toDateString()
  );

  return (
    <Box position="relative" height="100%" width="100%">
      <Box
        as="div"
        onClick={() => onAddButtonClick(date)}
        position="absolute"
        top="2px"
        right="2px"
        zIndex="1"
        minW="20px"
        height="20px"
        p="0"
        bg="green.400"
        color="white"
        borderRadius="full"
        fontSize="sm"
        textAlign="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        _hover={{ bg: 'green.500' }}
      >
        +
      </Box>
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
        {dayAbsences.map((absence, index) => (
          <Box
            key={absence.id || index}
            bg="blue.100"
            p={1}
            borderRadius="sm"
            boxShadow="sm"
            _hover={{ bg: 'blue.200', cursor: 'pointer' }}
          >
            <Box
              as="div"
              bg="red.400"
              color="white"
              px={2}
              py={1}
              borderRadius="sm"
              _hover={{ bg: 'red.500' }}
              onClick={() => onDelete(absence.id)}
              cursor="pointer"
            >
              Delete
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default TileContent;
