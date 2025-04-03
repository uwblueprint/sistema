import { CheckIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  Spacer,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useTheme } from '@chakra-ui/react';

import { useEffect, useState, useCallback } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import type { Location, SubjectAPI } from '@utils/types';

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
  const [isOpen, setIsOpen] = useState(false);
  const [subjects, setSubjects] = useState<Item[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/filter/subjects?archived=true');
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setSubjects(
          data.subjects.map((subject: SubjectAPI) => ({
            id: subject.id,
            name: subject.name,
            color: subject.colorGroup.colorCodes[1],
          }))
        );
      } catch (error) {
        console.error(error);
      }
    }
    fetchSubjects();
  }, []);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/filter/locations?archived=true');
        if (!response.ok) throw new Error('Failed to fetch locations');
        const data = await response.json();
        setLocations(
          data.locations.map((location: Location) => ({
            id: location.id,
            name: location.name,
            color: theme.colors.primaryBlue[300],
          }))
        );
      } catch (error) {
        console.error(error);
      }
    }
    fetchLocations();
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

  return (
    <Box width="100%">
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        width="100%"
        variant="ghost"
        px={1}
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
      <Box pl={1} mt={2}>
        <Collapse in={isOpen} animateOpacity>
          {subjects.length > 0 && (
            <>
              <Text
                textStyle="subtitle"
                color={theme.colors.text.subtitle}
                mb={2}
              >
                Subject
              </Text>
              <Stack spacing={2} mt={0} mb={3}>
                {subjects.map((subject) => (
                  <Box key={subject.id}>
                    <Flex
                      align="center"
                      cursor="pointer"
                      onClick={() => toggleSubject(subject.id)}
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
                        bg={
                          selectedSubjectIds.includes(subject.id)
                            ? subject.color
                            : 'white'
                        }
                        border={`2px solid ${subject.color}`}
                      >
                        {selectedSubjectIds.includes(subject.id) && (
                          <Icon
                            as={CheckIcon}
                            color="white"
                            w="14px"
                            h="14px"
                          />
                        )}
                      </Box>
                      <Text textStyle="subtitle">{subject.name}</Text>
                    </Flex>
                  </Box>
                ))}
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
                Location
              </Text>
              <Stack spacing={2} mt={0}>
                {locations.map((location) => (
                  <Box key={location.id}>
                    <Flex
                      align="center"
                      cursor="pointer"
                      onClick={() => toggleLocation(location.id)}
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
                        bg={
                          selectedLocationIds.includes(location.id)
                            ? location.color
                            : 'white'
                        }
                        border={`2px solid ${location.color}`}
                      >
                        {selectedLocationIds.includes(location.id) && (
                          <Icon
                            as={CheckIcon}
                            color="white"
                            w="14px"
                            h="14px"
                          />
                        )}
                      </Box>
                      <Text textStyle="subtitle">{location.name}</Text>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </Collapse>
      </Box>
    </Box>
  );
}
