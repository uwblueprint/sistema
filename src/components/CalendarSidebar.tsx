import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, useTheme } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { TacetLogo } from '../components/SistemaLogoColour';
import LocationDropdown from './LocationDropdown';
import MiniCalendar from './MiniCalendar';
import SubjectDropdown from './SubjectDropdown';
import ArchivedDropdown from './ArchivedDropdown';

interface CalendarSidebarProps {
  setSearchQuery: (query: {
    subjectIds: number[];
    locationIds: number[];
    archiveIds: number[];
  }) => void;
  onDateSelect: (date: Date) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  setSearchQuery,
  onDateSelect,
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
      <SubjectDropdown
        setFilter={setSubjectIds}
        showArchived={showArchivedSubjects}
      />
      <LocationDropdown
        setFilter={setLocationIds}
        showArchived={showArchivedLocations}
      />
      <ArchivedDropdown
        setFilter={setArchiveIds}
        onArchivedToggle={handleArchivedToggle}
      />
    </Flex>
  );
};

export default CalendarSidebar;
