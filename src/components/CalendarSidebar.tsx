import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, HStack, useTheme } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { TacetLogo } from '../components/SistemaLogoColour';
import LocationAccordion from './LocationAccordion';
import MiniCalendar from './MiniCalendar';
import SubjectAccordion from './SubjectAccordion';
import ArchivedAccordion from './ArchivedAccordion';

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

  const setActiveSubjectFilter = useCallback(
    (activeSubjectIds: number[]) => {
      setSearchQuery((prev) => ({
        ...prev,
        activeSubjectIds: activeSubjectIds,
      }));
    },
    [setSearchQuery]
  );

  const setArchivedSubjectFilter = useCallback(
    (archivedSubjectIds: number[]) => {
      setSearchQuery((prev) => ({
        ...prev,
        archivedSubjectIds: archivedSubjectIds,
      }));
    },
    [setSearchQuery]
  );

  const setActiveLocationFilter = useCallback(
    (activeLocationIds: number[]) => {
      setSearchQuery((prev) => ({
        ...prev,
        activeLocationIds: activeLocationIds,
      }));
    },
    [setSearchQuery]
  );

  const setArchivedLocationFilter = useCallback(
    (archivedLocationIds: number[]) => {
      setSearchQuery((prev) => ({
        ...prev,
        archivedLocationIds: archivedLocationIds,
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
      <Box width="110px">
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
      <SubjectAccordion setFilter={setActiveSubjectFilter} />
      <LocationAccordion setFilter={setActiveLocationFilter} />

      <ArchivedAccordion
        setSubjectFilter={setArchivedSubjectFilter}
        setLocationFilter={setArchivedLocationFilter}
      />
    </Flex>
  );
};

export default CalendarSidebar;
