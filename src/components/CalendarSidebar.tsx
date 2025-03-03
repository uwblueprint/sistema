import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, useTheme } from '@chakra-ui/react';
import React from 'react';
import { SistemaLogoColour } from '../components/SistemaLogoColour';
import LocationDropdown from './LocationDropdown';
import MiniCalendar from './MiniCalendar';
import SubjectDropdown from './SubjectDropdown';

interface CalendarSidebarProps {
  setSearchQuery: React.Dispatch<
    React.SetStateAction<{ titles: string[]; locations: string[] }>
  >;
  onDateSelect: (date: Date) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  setSearchQuery,
  onDateSelect,
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
      width="280px"
      padding={theme.space[4]}
      flexDirection="column"
      gap={theme.space[4]}
      alignItems="center"
    >
      <Box width="150px">
        <SistemaLogoColour />
      </Box>

      <Button
        paddingX="40px"
        variant="outline"
        borderColor={theme.colors.neutralGray[300]}
        size="lg"
        leftIcon={<AddIcon color="blue.500" />}
      >
        Declare Absence
      </Button>
      <MiniCalendar initialDate={new Date()} onDateSelect={onDateSelect} />
      <SubjectDropdown setFilter={handleSubjectFilter} />
      <LocationDropdown setFilter={handleLocationFilter} />
    </Flex>
  );
};

export default CalendarSidebar;
