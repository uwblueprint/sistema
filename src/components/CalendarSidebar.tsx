import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, HStack, useTheme } from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import { TacetLogo } from '../components/SistemaLogoColour';
import ArchivedAccordion from './ArchivedAccordion';
import LocationAccordion from './LocationAccordion';
import MiniCalendar from './MiniCalendar';
import SubjectAccordion from './SubjectAccordion';

interface CalendarSidebarProps {
  setSearchQuery: (query: {
    subjectIds: number[];
    locationIds: number[];
    archiveIds: number[];
  }) => void;
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
  const [subjectIds, setSubjectIds] = useState<number[]>([]);
  const [locationIds, setLocationIds] = useState<number[]>([]);
  const [archiveIds, setArchiveIds] = useState<number[]>([]);

  const theme = useTheme();
  const [showArchivedSubjects, setShowArchivedSubjects] = useState(false);
  const [showArchivedLocations, setShowArchivedLocations] = useState(false);

  const handleSetSubjectIds = useCallback((ids: number[]) => {
    setSubjectIds(ids);
  }, []);

  const handleSetLocationIds = useCallback((ids: number[]) => {
    setLocationIds(ids);
  }, []);

  const handleSetArchiveIds = useCallback((ids: number[]) => {
    setArchiveIds(ids);
  }, []);

  const memoizedSetSearchQuery = useCallback(() => {
    setSearchQuery({
      subjectIds,
      locationIds,
      archiveIds,
    });
  }, [subjectIds, locationIds, archiveIds, setSearchQuery]);

  useEffect(() => {
    memoizedSetSearchQuery();
  }, [memoizedSetSearchQuery]);

  const handleArchivedToggle = useCallback(
    (subjectsArchived: boolean, locationsArchived: boolean) => {
      setShowArchivedSubjects(subjectsArchived);
      setShowArchivedLocations(locationsArchived);
    },
    []
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
      <SubjectAccordion
        setFilter={handleSetSubjectIds}
        showArchived={showArchivedSubjects}
      />
      <LocationAccordion
        setFilter={handleSetLocationIds}
        showArchived={showArchivedLocations}
      />
      <ArchivedAccordion
        setFilter={handleSetArchiveIds}
        onArchivedToggle={handleArchivedToggle}
      />
    </Flex>
  );
};

export default CalendarSidebar;
