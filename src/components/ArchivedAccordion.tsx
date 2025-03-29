import { useTheme } from '@chakra-ui/react';
import type { Location, SubjectAPI } from '@utils/types';
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
  const [isOpen, setIsOpen] = useState(false);
  const [subjects, setSubjects] = useState<AccordionItem[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
  const [locations, setLocations] = useState<AccordionItem[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  useEffect(() => {
    async function fetchSubjects() {
      try {
        const subjectResponse = await fetch(
          '/api/filter/subjects?archived=true'
        );
        if (!subjectResponse.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const subjectData = await subjectResponse.json();
        if (subjectData.subjects) {
          const fetchedSubjects = subjectData.subjects.map(
            (subject: SubjectAPI) => ({
              id: subject.id,
              name: subject.name,
              color: subject.colorGroup.colorCodes[1],
            })
          );
          setSubjects(fetchedSubjects);

          const subjectIds = fetchedSubjects.map((subject) => subject.id);
          setSelectedSubjectIds(subjectIds);
          setSubjectFilter(subjectIds);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }

    fetchSubjects();
  }, [theme.colors.primaryBlue, setSubjectFilter]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const locationResponse = await fetch(
          '/api/filter/locations?archived=true'
        );
        if (!locationResponse.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await locationResponse.json();
        if (data.locations) {
          const fetchedLocations = data.locations.map((location: Location) => ({
            id: location.id,
            name: location.name,
            color: theme.colors.primaryBlue[300],
          }));

          setLocations(fetchedLocations);

          const allLocationIds = fetchedLocations.map(
            (location) => location.id
          );
          setSelectedLocationIds(allLocationIds);
          setLocationFilter(allLocationIds);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    fetchLocations();
  }, [theme.colors.primaryBlue, setLocationFilter]);

  const toggleSubject = useCallback(
    (subjectId: number) => {
      setSelectedSubjectIds((prevSelected) => {
        let newSelection;
        if (prevSelected.includes(subjectId)) {
          newSelection = prevSelected.filter((s) => s !== subjectId);
        } else {
          newSelection = [...prevSelected, subjectId];
        }

        setSubjectFilter(newSelection);
        return newSelection;
      });
    },
    [setSubjectFilter]
  );

  const toggleLocation = useCallback(
    (locationId: number) => {
      setSelectedLocationIds((prevSelected) => {
        let newSelection;
        if (prevSelected.includes(locationId)) {
          newSelection = prevSelected.filter((s) => s !== locationId);
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
    ...subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      color: subject.color,
      subtitle: 'Subjects',
    })),
    ...locations.map((location) => ({
      id: location.id,
      name: location.name,
      color: location.color,
      subtitle: 'Locations',
    })),
  ];

  return (
    <Accordion
      title="Archived"
      items={accordionItems}
      selectedItems={[...selectedSubjectIds, ...selectedLocationIds]}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={(id: number) => {
        if (subjects.some((subject) => subject.id === id)) {
          toggleSubject(id);
        } else {
          toggleLocation(id);
        }
      }}
      textColor={theme.colors.text.subtitle}
    />
  );
}
