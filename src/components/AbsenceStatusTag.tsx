import { Box } from '@chakra-ui/react';

const AbsenceStatusTag = ({ substituteTeacher }) => {
  return (
    <Box
      position="absolute"
      top="10px"
      left="23px"
      px={3}
      py={1}
      fontSize="sm"
      borderRadius="md"
      color="white"
      bg={substituteTeacher ? 'green.500' : 'yellow.400'}
    >
      {substituteTeacher ? `Filled by ${substituteTeacher}` : 'Unfilled'}
    </Box>
  );
};

export default AbsenceStatusTag;
