import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, HStack, useTheme } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { TacetLogo } from '../components/SistemaLogoColour';
import LocationDropdown from './LocationDropdown';
import MiniCalendar from './MiniCalendar';
import SubjectDropdown from './SubjectDropdown';

interface CalendarSidebarProps {
  setSearchQuery;
  onDateSelect: (date: Date) => void;
  onDeclareAbsenceClick: () => void;
  selectDate: Date | null;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  setSearchQuery,
  onDateSelect,
  onDeclareAbsenceClick,
  selectDate,
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
      height="100vh"
      overflowY="auto"
    >
      <Box width="150px">
        <TacetLogo />
      </Box>
      <HStack>
        <Button
          width="240px"
          variant="outline"
          borderColor={theme.colors.neutralGray[300]}
          onClick={onDeclareAbsenceClick}
          leftIcon={<AddIcon color={theme.colors.primaryBlue[300]} />}
        >
          Declare Absence
        </Button>
      </HStack>
      <MiniCalendar
        initialDate={new Date()}
        onDateSelect={onDateSelect}
        selectDate={selectDate}
      />
      <SubjectDropdown setFilter={setSubjectIdFilter} />
      <LocationDropdown setFilter={setLocationIdFilter} />
    </Flex>
  );
};

export default CalendarSidebar;
