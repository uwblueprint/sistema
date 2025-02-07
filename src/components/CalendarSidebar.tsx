import React from 'react';
import { Flex, Box, Button, useTheme } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { SistemaLogoColour } from '../components/SistemaLogoColour';

const CalendarSidebar: React.FC = () => {
  const theme = useTheme();

  return (
    <Flex
      width="260px"
      padding={theme.space[4]}
      flexDirection="column"
      gap={theme.space[4]}
      alignItems="center"
    >
      <Box width="150px">
        <SistemaLogoColour />
      </Box>
      <Button colorScheme="blue" size="lg" leftIcon={<AddIcon />}>
        Declare Absence
      </Button>
    </Flex>
  );
};

export default CalendarSidebar;
