import { Box, Flex } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { FiClock } from 'react-icons/fi';

const AbsenceStatusTag = ({ substituteTeacher }) => {
  return (
    <Box
      sx={{ padding: '5px 12px 5px 10px' }}
      fontSize="12px"
      borderRadius="5px"
      color={substituteTeacher ? '#2D4F12' : '#9B520E'}
      bg={substituteTeacher ? '#D8F5C1' : '#FEEED5'}
    >
      <Flex gap="7px">
        {substituteTeacher ? (
          <FiCheckCircle size="20px" />
        ) : (
          <FiClock size="20px" />
        )}

        {substituteTeacher ? `Filled by ${substituteTeacher}` : 'Unfilled'}
      </Flex>
    </Box>
  );
};

export default AbsenceStatusTag;
