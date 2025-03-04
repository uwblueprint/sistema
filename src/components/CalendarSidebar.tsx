import React, { useCallback } from 'react';
import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, useTheme } from '@chakra-ui/react';
import { SistemaLogoColour } from '../components/SistemaLogoColour';
import LocationDropdown from './LocationDropdown';
import MiniCalendar from './MiniCalendar';
import SubjectDropdown from './SubjectDropdown';

interface CalendarSidebarProps {
  setSearchQuery;
  onDateSelect: (date: Date) => void;
  onDeclareAbsenceClick: () => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  setSearchQuery,
  onDateSelect,
  onDeclareAbsenceClick,
}) => {
  const theme = useTheme();

  const setSubjectIdFilter = useCallback(
    (subjectIds: number[]) => {
      setSearchQuery((prev) => ({
        ...prev,
        subjectIds,
      }));
    },
    [setSearchQuery]
  );

  const setLocationIdFilter = useCallback(
    (locationIds: number[]) => {
      setSearchQuery((prev) => ({
        ...prev,
        locationIds,
      }));
    },
    [setSearchQuery]
  );

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
        onClick={onDeclareAbsenceClick}
        leftIcon={<AddIcon color={theme.colors.primaryBlue[300]} />}
      >
        Declare Absence
      </Button>
      <MiniCalendar initialDate={new Date()} onDateSelect={onDateSelect} />
      <SubjectDropdown setFilter={setSubjectIdFilter} />
      <LocationDropdown setFilter={setLocationIdFilter} />
    </Flex>
  );
};

export default CalendarSidebar;
