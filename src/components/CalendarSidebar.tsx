import React from 'react';
import { Flex, Box, Button, useTheme } from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { SistemaLogoColour } from '../components/SistemaLogoColour';
import SubjectDropdown from './SubjectDropdown';
import LocationDropdown from './LocationDropdown';

interface CalendarSidebarProps {
  setSearchQuery: React.Dispatch<
    React.SetStateAction<{ titles: string[]; locations: string[] }>
  >;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  setSearchQuery,
}) => {
  const theme = useTheme();

  const handleSubjectFilter = (subjects: string[]) => {
    setSearchQuery((prev) => ({
      ...prev,
      titles: subjects,
    }));
  };

  const handleLocationFilter = (locations: string[]) => {
    setSearchQuery((prev) => ({
      ...prev,
      locations: locations,
    }));
  };

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
      <Button width="100%" colorScheme="blue" size="lg" leftIcon={<AddIcon />}>
        Declare Absence
      </Button>

      <SubjectDropdown setFilter={handleSubjectFilter} />

      <LocationDropdown setFilter={handleLocationFilter} />
    </Flex>
  );
};

export default CalendarSidebar;
