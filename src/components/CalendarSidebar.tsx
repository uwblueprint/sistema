import { AddIcon } from '@chakra-ui/icons';
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Flex, HStack, useTheme } from '@chakra-ui/react';
import { TacetLogo } from '../components/SistemaLogoColour';
import LocationAccordion from './LocationAccordion';
import SubjectAccordion from './SubjectAccordion';
import ArchivedDropdown from './ArchivedDropdown';
import MiniCalendar from './MiniCalendar';

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

  useEffect(() => {
    setSearchQuery({
      subjectIds,
      locationIds,
      archiveIds,
    });
  }, [subjectIds, locationIds, archiveIds, setSearchQuery]);

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
      <SubjectAccordion setFilter={setSubjectIdFilter} />
      <LocationAccordion setFilter={setLocationIdFilter} />
      <ArchivedDropdown
        setFilter={setArchiveIds}
        onArchivedToggle={handleArchivedToggle}
      />
    </Flex>
  );
};

export default CalendarSidebar;
