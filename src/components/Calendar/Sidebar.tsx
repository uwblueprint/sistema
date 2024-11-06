import { Box, VStack, Text, Checkbox, Divider } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Subject } from '../../types/subject';
import { Location } from '../../types/location';

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

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsRes, subjectsRes] = await Promise.all([
          fetch('/api/locations'),
          fetch('/api/subjects'),
        ]);

        const locationsData = await locationsRes.json();
        const subjectsData = await subjectsRes.json();

        setLocations(locationsData.locations);
        setSubjects(subjectsData.subjects);

        // defaultly show all subjects and locations
        locationsData.locations.forEach((location: Location) => {
          onLocationChange(location.id, true);
        });
        subjectsData.subjects.forEach((subject: Subject) => {
          onSubjectChange(subject.id, true); //
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log(subjects);
  }, []);

  return (
    <Box
      w="300px"
      p="4"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      height="100vh"
    >
      {/* Class Type Filter Section */}
      <VStack align="flex-start" mb="6">
        <Text fontSize="md" fontWeight="bold">
          Class Type
        </Text>
        {subjects.map((subject) => (
          <Checkbox
            key={subject.id}
            isChecked={selectedSubjects.includes(subject.id)}
            onChange={(e) => onSubjectChange(subject.id, e.target.checked)}
          >
            {subject.name}
          </Checkbox>
        ))}
      </VStack>

      <Divider />

      {/* Location Filter Section */}
      <VStack align="flex-start" mt="6">
        <Text fontSize="md" fontWeight="bold">
          Location
        </Text>
        {locations.map((location) => (
          <Checkbox
            key={location.id}
            isChecked={selectedLocations.includes(location.id)}
            onChange={(e) => onLocationChange(location.id, e.target.checked)}
          >
            {location.name}
          </Checkbox>
        ))}
      </VStack>
    </Box>
  );
};

export default Sidebar;
