import { CheckIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  Stack,
  Text,
  Tooltip,
  useTheme,
} from '@chakra-ui/react';
import type { Location, SubjectAPI } from '@utils/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useCustomToast } from '../../CustomToast';

interface ArchivedAccordionProps {
  setSubjectFilter: (subjectIds: number[]) => void;
  setLocationFilter: (locationIds: number[]) => void;
}

interface Item {
  id: number;
  name: string;
  color: string;
  subtitle?: string;
}

export default function ArchivedAccordion({
  setSubjectFilter,
  setLocationFilter,
}: ArchivedAccordionProps) {
  const theme = useTheme();
  const toast = useCustomToast();
  const toastRef = useRef(toast);

  const [isOpen, setIsOpen] = useState(false);
  const [subjects, setSubjects] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    async function fetchArchivedData() {
      try {
        const response = await fetch('/api/filter/subjects?archived=true');
        if (!response.ok) {
          let errorMessage = 'Failed to fetch subjects: ';
          try {
            const errorData = await response.json();
            errorMessage +=
              errorData?.error || response.statusText || 'Unknown error';
          } catch {
            errorMessage += response.statusText || 'Unknown error';
          }
          console.error(errorMessage);
          toastRef.current({ description: errorMessage, status: 'error' });
          return;
        }
        const data = await response.json();
        setSubjects(
          data.subjects.map((subject: SubjectAPI) => ({
            id: subject.id,
            name: subject.name,
            color: subject.colorGroup.colorCodes[1],
          }))
        );
      } catch (err: any) {
        const errorMessage = err?.message
          ? `Failed to fetch subjects: ${err.message}`
          : 'Failed to fetch subjects.';
        console.error(errorMessage, err);
        toastRef.current({ description: errorMessage, status: 'error' });
        return;
      }

      try {
        const response = await fetch('/api/filter/locations?archived=true');
        if (!response.ok) {
          let errorMessage = 'Failed to fetch locations: ';
          try {
            const errorData = await response.json();
            errorMessage +=
              errorData?.error || response.statusText || 'Unknown error';
          } catch {
            errorMessage += response.statusText || 'Unknown error';
          }
          console.error(errorMessage);
          toastRef.current({ description: errorMessage, status: 'error' });
          return;
        }
        const data = await response.json();
        setLocations(
          data.locations.map((location: Location) => ({
            id: location.id,
            name: location.name,
            color: theme.colors.primaryBlue[300],
          }))
        );
      } catch (err: any) {
        const errorMessage = err?.message
          ? `Failed to fetch locations: ${err.message}`
          : 'Failed to fetch locations.';
        console.error(errorMessage, err);
        toastRef.current({ description: errorMessage, status: 'error' });
        return;
      }
    }

    fetchArchivedData().finally(() => {
      setLoaded(true);
    });
  }, [theme.colors.primaryBlue]);

  const toggleSubject = useCallback(
    (subjectId: number) => {
      setSelectedSubjectIds((prev) => {
        const newSelection = prev.includes(subjectId)
          ? prev.filter((id) => id !== subjectId)
          : [...prev, subjectId];
        setSubjectFilter(newSelection);
        return newSelection;
      });
    },
    [setSubjectFilter]
  );

  const toggleLocation = useCallback(
    (locationId: number) => {
      setSelectedLocationIds((prev) => {
        const newSelection = prev.includes(locationId)
          ? prev.filter((id) => id !== locationId)
          : [...prev, locationId];
        setLocationFilter(newSelection);
        return newSelection;
      });
    },
    [setLocationFilter]
  );

  if (loaded && subjects.length === 0 && locations.length === 0) {
    return null;
  }

  const bgColor = theme.colors.white;

  const renderItem = (
    item: Item,
    isSelected: boolean,
    onToggle: (id: number) => void
  ) => {
    const needsTooltip = item.name.length > 20;

    return (
      <Flex
        key={item.id}
        align="center"
        cursor="pointer"
        onClick={() => onToggle(item.id)}
        width="100%"
      >
        <Box
          width="20px"
          height="20px"
          mr={2}
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="2px"
          bg={isSelected ? item.color : 'white'}
          border={`2px solid ${item.color}`}
        >
          {isSelected && (
            <Icon as={CheckIcon} color="white" w="14px" h="14px" />
          )}
        </Box>

        <Tooltip
          label={item.name}
          placement="top"
          openDelay={300}
          isDisabled={!needsTooltip}
          hasArrow
          shouldWrapChildren
        >
          <Box flex="1" position="relative" overflow="hidden">
            <Text
              textStyle="subtitle"
              color={theme.colors.text.subtitle}
              width="200px"
              whiteSpace="nowrap"
              noOfLines={1}
              pr="30px"
            >
              {item.name}
            </Text>
            <Box
              position="absolute"
              top="0"
              right="0"
              width="30px"
              height="100%"
              pointerEvents="none"
              bgGradient={`linear(to-r, transparent, ${bgColor})`}
            />
          </Box>
        </Tooltip>
      </Flex>
    );
  };

  return (
    <Box width="100%">
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        width="100%"
        variant="ghost"
        px={2}
        py={0}
        height="32px"
      >
        <Flex justify="space-between" align="center" width="100%">
          <Text textStyle="h4" color={theme.colors.text.subtitle}>
            Archived
          </Text>
          {isOpen ? (
            <IoChevronUp size={24} color={theme.colors.text.subtitle} />
          ) : (
            <IoChevronDown size={24} color={theme.colors.text.subtitle} />
          )}
        </Flex>
      </Button>

      <Box px={2} mt={2}>
        <Collapse in={isOpen} animateOpacity>
          {subjects.length > 0 && (
            <>
              <Text
                textStyle="subtitle"
                color={theme.colors.text.subtitle}
                mb={2}
              >
                Subjects
              </Text>
              <Stack spacing={2} mb={3}>
                {subjects.map((s) =>
                  renderItem(
                    s,
                    selectedSubjectIds.includes(s.id),
                    toggleSubject
                  )
                )}
              </Stack>
            </>
          )}
          {locations.length > 0 && (
            <>
              <Text
                textStyle="subtitle"
                color={theme.colors.text.subtitle}
                mb={2}
              >
                Locations
              </Text>
              <Stack spacing={2}>
                {locations.map((l) =>
                  renderItem(
                    l,
                    selectedLocationIds.includes(l.id),
                    toggleLocation
                  )
                )}
              </Stack>
            </>
          )}
        </Collapse>
      </Box>
    </Box>
  );
}
