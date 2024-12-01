import {
  Box,
  VStack,
  Text,
  Checkbox,
  Divider,
  useDisclosure,
  IconButton,
  HStack,
  Collapse,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useEffect, useState } from 'react';
import { Subject } from '../../types/subject';
import { Location } from '../../types/location';
import {
  mapName,
  subjectProperties,
  transformName,
} from '../../utils/nameMapper';

interface SidebarProps {
  selectedSubjects: number[];
  selectedLocations: number[];
  onSubjectChange: (subject: number, isSelected: boolean) => void;
  onLocationChange: (location: number, isSelected: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  selectedSubjects,
  selectedLocations,
  onSubjectChange,
  onLocationChange,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Disclosure hooks for toggles
  const { isOpen: isSubjectOpen, onToggle: toggleSubjects } = useDisclosure({
    defaultIsOpen: true,
  });
  const { isOpen: isLocationOpen, onToggle: toggleLocations } = useDisclosure({
    defaultIsOpen: true,
  });

  // Fetch subjects and locations dynamically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, subjectsRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/subjects'),
        ]);

        const locationsData = await locationsRes.json();
        const subjectsData = await subjectsRes.json();

        // Dynamically assign colors to subjects

        const mappedLocations = locationsData.locations.map(
          (location: Location) => ({
            ...location,
            name: mapName(location.name), // Use the utility function
          })
        );
        const mappedSubjects = subjectsData.subjects.map((subject: Subject) => {
          const properties = subjectProperties[subject.name] || {
            color: '#000000',
          }; // Fallback to black
          return {
            ...subject,
            name: transformName(subject.name), // Transform the name for display
            color: properties.color,
          };
        });

        setSubjects(mappedSubjects);
        setLocations(mappedLocations);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <Box
      w="262px"
      p="4"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      height="100vh"
    >
      {/* Subject Dropdown */}
      <VStack align="flex-start" mb="4">
        <HStack justify="space-between" w="full">
          <Text fontSize="md" fontWeight="bold">
            Subject
          </Text>
          <IconButton
            aria-label="Toggle Subject"
            icon={isSubjectOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="lg"
            variant="ghost"
            onClick={toggleSubjects}
          />
        </HStack>
        <Collapse in={isSubjectOpen}>
          <VStack align="flex-start" spacing="2" mt="2">
            {subjects.map((subject) => (
              <HStack key={subject.id} align="center" w="full">
                <Checkbox
                  isChecked={selectedSubjects.includes(subject.id)}
                  onChange={(e) =>
                    onSubjectChange(subject.id, e.target.checked)
                  }
                  size="lg"
                  iconColor="white"
                  borderColor={subject.color}
                  _checked={{
                    '& .chakra-checkbox__control': {
                      background: subject.color,
                      borderColor: subject.color,
                    },
                  }}
                >
                  <Text>{subject.name}</Text>
                </Checkbox>
              </HStack>
            ))}
          </VStack>
        </Collapse>
      </VStack>

      <Divider />

      {/* Location Dropdown */}
      <VStack align="flex-start" mt="4">
        <HStack justify="space-between" w="full">
          <Text fontSize="md" fontWeight="bold">
            Location
          </Text>
          <IconButton
            aria-label="Toggle Location"
            icon={isLocationOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="lg"
            variant="ghost"
            onClick={toggleLocations}
          />
        </HStack>
        <Collapse in={isLocationOpen}>
          <VStack align="flex-start" spacing="2" mt="2">
            {locations.map((location) => (
              <HStack key={location.id} align="center" w="full">
                <Checkbox
                  isChecked={selectedLocations.includes(location.id)}
                  onChange={(e) =>
                    onLocationChange(location.id, e.target.checked)
                  }
                  colorScheme="blue"
                  size="lg"
                />
                <Text>{location.name}</Text>
              </HStack>
            ))}
          </VStack>
        </Collapse>
      </VStack>
    </Box>
  );
};

export default Sidebar;
