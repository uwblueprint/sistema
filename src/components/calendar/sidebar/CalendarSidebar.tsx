import { AddIcon } from '@chakra-ui/icons';
import { Box, Button, Flex, useTheme } from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCustomToast } from '../../CustomToast';
import { TacetLogo } from '../../TacetLogo';
import MiniCalendar from '../MiniCalendar';
import AbsenceStatusAccordion from './AbsenceStatusAccordion';
import ArchivedAccordion from './ArchivedAccordion';
import LocationAccordion from './LocationAccordion';
import SubjectAccordion from './SubjectAccordion';

interface CalendarSidebarProps {
  setSearchQuery;
  onDateSelect: (date: Date) => void;
  onDeclareAbsenceClick: () => void;
  selectDate: Date | null;
  isAdminMode: boolean;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  setSearchQuery,
  onDateSelect,
  onDeclareAbsenceClick,
  selectDate,
  isAdminMode,
}) => {
  const theme = useTheme();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showDivider, setShowDivider] = useState(false);
  const [archivedSubjects, setArchivedSubjects] = useState([]);
  const [archivedLocations, setArchivedLocations] = useState([]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      setShowDivider(scrollTop > 5);
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

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

  const showToast = useCustomToast();
  const showToastRef = useRef(showToast);

  useEffect(() => {
    async function fetchArchivedData() {
      try {
        const subjectRes = await fetch('/api/filter/subjects?archived=true');
        if (!subjectRes.ok) {
          let errorMessage = 'Failed to fetch archived subjects: ';
          try {
            const errorData = await subjectRes.json();
            errorMessage +=
              errorData?.error || subjectRes.statusText || 'Unknown error';
          } catch {
            errorMessage += subjectRes.statusText || 'Unknown error';
          }
          console.error(errorMessage);
          showToastRef.current({ description: errorMessage, status: 'error' });
          return;
        }

        const locationRes = await fetch('/api/filter/locations?archived=true');
        if (!locationRes.ok) {
          let errorMessage = 'Failed to fetch archived locations: ';
          try {
            const errorData = await locationRes.json();
            errorMessage +=
              errorData?.error || locationRes.statusText || 'Unknown error';
          } catch {
            errorMessage += locationRes.statusText || 'Unknown error';
          }
          console.error(errorMessage);
          showToastRef.current({ description: errorMessage, status: 'error' });
          return;
        }

        const subjectsData = await subjectRes.json();
        const locationsData = await locationRes.json();

        setArchivedSubjects(subjectsData.subjects);
        setArchivedLocations(locationsData.locations);
      } catch (error: any) {
        const errorMessage = error?.message
          ? `Failed to fetch archived data: ${error.message}`
          : 'Failed to fetch archived data.';
        console.error(errorMessage, error);
        showToastRef.current({ description: errorMessage, status: 'error' });
      }
    }

    fetchArchivedData();
  }, []);

  return (
    <Flex
      minWidth="265px"
      width="265px"
      flexDirection="column"
      alignItems="center"
      height="100%"
      overflow="hidden"
    >
      <Box
        position="sticky"
        top={0}
        zIndex={1}
        bg="white"
        py={4}
        borderBottom={showDivider ? '1px solid' : 'none'}
        borderColor="neutralGray.300"
      >
        <Flex direction="column" align="center" gap={5}>
          <Box width="110px" display="flex" justifyContent="center">
            <TacetLogo />
          </Box>
          <Button
            width="240px"
            variant="outline"
            borderColor={theme.colors.neutralGray[300]}
            onClick={onDeclareAbsenceClick}
            leftIcon={<AddIcon color={theme.colors.primaryBlue[300]} />}
            h="45px"
          >
            Declare Absence
          </Button>
        </Flex>
      </Box>
      <Box ref={scrollRef} overflowY="auto" pb={6} width="100%">
        <Box px={3} pb={4}>
          <MiniCalendar
            initialDate={new Date()}
            onDateSelect={onDateSelect}
            selectDate={selectDate}
          />
        </Box>
        <Box
          px={3}
          gap={theme.space[4]}
          display="flex"
          flex="1"
          flexDirection="column"
        >
          {isAdminMode && (
            <AbsenceStatusAccordion setFilter={setAbsenceStatusFilter} />
          )}
          <SubjectAccordion setFilter={setActiveSubjectFilter} />
          <LocationAccordion setFilter={setActiveLocationFilter} />

          {(archivedSubjects.length > 0 || archivedLocations.length > 0) && (
            <ArchivedAccordion
              setSubjectFilter={setArchivedSubjectFilter}
              setLocationFilter={setArchivedLocationFilter}
            />
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default CalendarSidebar;
