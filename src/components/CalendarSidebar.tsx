import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, useTheme } from '@chakra-ui/react';
import React from 'react';
import { SistemaLogoColour } from '../components/SistemaLogoColour';
import LocationDropdown from './LocationDropdown';
import MiniCalendar from './MiniCalendar';
import SubjectDropdown from './SubjectDropdown';

interface CalendarSidebarProps {
  setSearchQuery: React.Dispatch<
    React.SetStateAction<{ subjectIds: number[]; locationIds: number[] }>
  >;
  onDateSelect: (date: Date) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  setSearchQuery,
  onDateSelect,
}) => {
  const theme = useTheme();

  const handleSubjectFilter = (subjectIds: number[]) => {
    setSearchQuery((prev) => ({
      ...prev,
      subjectIds: subjectIds,
    }));
  };

  const handleLocationFilter = (locationIds: number[]) => {
    setSearchQuery((prev) => ({
      ...prev,
      locationIds: locationIds,
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
        leftIcon={<AddIcon color={theme.colors.primaryBlue[300]} />}
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
