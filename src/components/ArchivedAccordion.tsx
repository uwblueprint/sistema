import { useTheme } from '@chakra-ui/react';
import { useEffect, useState, useCallback } from 'react';
import Accordion, { AccordionItem } from './Accordion';

interface ArchivedAccordionProps {
  setSubjectFilter: (subjectIds: number[]) => void;
  setLocationFilter: (locationIds: number[]) => void;
}

export default function ArchivedAccordion({
  setSubjectFilter,
  setLocationFilter,
}: ArchivedAccordionProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [archivedLocations, setArchivedLocations] = useState<AccordionItem[]>(
    []
  );
  const [archivedSubjects, setArchivedSubjects] = useState<AccordionItem[]>([]);
  const [selectedArchivedSubjectIds, setSelectedArchivedSubjectIds] = useState<
    number[]
  >([]);
  const [selectedArchivedLocationIds, setSelectedArchivedLocationIds] =
    useState<number[]>([]);

  useEffect(() => {
    async function fetchArchivedData() {
      try {
        const locationResponse = await fetch(
          '/api/filter/locations?archived=true'
        );
        if (!locationResponse.ok)
          throw new Error('Failed to fetch archived locations');
        const locationData = await locationResponse.json();
        if (locationData.locations) {
          const fetchedLocations = locationData.locations.map(
            (location: any) => ({
              id: location.id,
              name: location.name,
              color: theme.colors.primaryBlue[300],
            })
          );
          setArchivedLocations(fetchedLocations);
        }

        const subjectResponse = await fetch(
          '/api/filter/subjects?archived=true'
        );
        if (!subjectResponse.ok)
          throw new Error('Failed to fetch archived subjects');
        const subjectData = await subjectResponse.json();
        if (subjectData.subjects) {
          const fetchedSubjects = subjectData.subjects.map((subject: any) => ({
            id: subject.id,
            name: subject.name,
            color: subject.colorGroup.colorCodes[1],
          }));
          setArchivedSubjects(fetchedSubjects);
        }
      } catch (error) {
        console.error('Error fetching archived data:', error);
      }
    }

    fetchArchivedData();
  }, [theme.colors.primaryBlue]);

  const toggleArchivedSubject = useCallback(
    (subjectId: number) => {
      setSelectedArchivedSubjectIds((prevSelected) => {
        let newSelection;
        if (prevSelected.includes(subjectId)) {
          newSelection = prevSelected.filter((id) => id !== subjectId);
        } else {
          newSelection = [...prevSelected, subjectId];
        }
        setSubjectFilter(newSelection);
        return newSelection;
      });
    },
    [setSubjectFilter]
  );

  const toggleArchivedLocation = useCallback(
    (locationId: number) => {
      setSelectedArchivedLocationIds((prevSelected) => {
        let newSelection;
        if (prevSelected.includes(locationId)) {
          newSelection = prevSelected.filter((id) => id !== locationId);
        } else {
          newSelection = [...prevSelected, locationId];
        }
        setLocationFilter(newSelection);
        return newSelection;
      });
    },
    [setLocationFilter]
  );

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const accordionItems: AccordionItem[] = [
    ...archivedSubjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      subtitle: 'Subjects',
    })),
    ...archivedLocations.map((location) => ({
      id: location.id,
      name: location.name,
      color: location.color,
      subtitle: 'Locations',
    })),
  ];

  return (
    <Accordion
      title="Archived"
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      selectedItems={[
        ...selectedArchivedSubjectIds,
        ...selectedArchivedLocationIds,
      ]}
      toggleItem={(id: number) => {
        if (archivedSubjects.some((subject) => subject.id === id)) {
          toggleArchivedSubject(id);
        } else {
          toggleArchivedLocation(id);
        }
      }}
      items={accordionItems}
    />
  );
}
