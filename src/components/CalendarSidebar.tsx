import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, useTheme } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { TacetLogo } from '../components/SistemaLogoColour';
import LocationDropdown from './LocationDropdown';
import MiniCalendar from './MiniCalendar';
import SubjectDropdown from './SubjectDropdown';
import ArchivedDropdown from './ArchivedDropdown';

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

  const setArchiveIdFilter = useCallback(
    (archiveIds: number[]) => {
      setSearchQuery((prev) => ({
        ...prev,
        archiveIds,
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
      <SubjectDropdown setFilter={setSubjectIdFilter} />
      <LocationDropdown setFilter={setLocationIdFilter} />
      <ArchivedDropdown setFilter={setArchiveIdFilter} />
    </Flex>
  );
};

export default CalendarSidebar;
