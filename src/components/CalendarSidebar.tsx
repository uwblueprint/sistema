import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, HStack, useTheme } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { TacetLogo } from '../components/SistemaLogoColour';
import AbsenceStatusAccordion from './AbsenceStatusAccordion';
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

  const [archivedSubjects, setArchivedSubjects] = useState([]);
  const [archivedLocations, setArchivedLocations] = useState([]);

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

  const setAbsenceStatusFilter = useCallback(
    (activeAbsenceStatusIds: number[]) => {
      setSearchQuery((prev) => ({
        ...prev,
        activeAbsenceStatusIds: activeAbsenceStatusIds,
      }));
    },
    [setSearchQuery]
  );

  useEffect(() => {
    // Fetch archived subjects and locations
    async function fetchArchivedData() {
      try {
        const subjectRes = await fetch('/api/filter/subjects?archived=true');
        const locationRes = await fetch('/api/filter/locations?archived=true');

        const subjectsData = await subjectRes.json();
        const locationsData = await locationRes.json();

        setArchivedSubjects(subjectsData.subjects);
        setArchivedLocations(locationsData.locations);
      } catch (error) {
        console.error(error);
      }
    }

    fetchArchivedData();
  }, []);

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
      <AbsenceStatusAccordion setFilter={setAbsenceStatusFilter} />
      <SubjectAccordion setFilter={setActiveSubjectFilter} />
      <LocationAccordion setFilter={setActiveLocationFilter} />

      {(archivedSubjects.length > 0 || archivedLocations.length > 0) && (
        <ArchivedAccordion
          setSubjectFilter={setArchivedSubjectFilter}
          setLocationFilter={setArchivedLocationFilter}
        />
      )}
    </Flex>
  );
};

export default CalendarSidebar;
