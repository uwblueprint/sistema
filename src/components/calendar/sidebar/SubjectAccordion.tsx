import { useTheme } from '@chakra-ui/react';
import type { SubjectAPI } from '@utils/types';
import { useCallback, useEffect, useState } from 'react';
import Accordion, { AccordionItem } from './Accordion';

interface SubjectAccordionProps {
  setFilter: (subjects: number[]) => void;
}

export default function SubjectAccordion({ setFilter }: SubjectAccordionProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [subjects, setSubjects] = useState<AccordionItem[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/filter/subjects?archived=false');
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const data = await response.json();
        if (data.subjects) {
          const fetchedSubjects = data.subjects.map((subject: SubjectAPI) => ({
            id: subject.id,
            name: subject.name,
            color: subject.colorGroup.colorCodes[1],
          }));
          setSubjects(fetchedSubjects);

          const subjectIds = fetchedSubjects.map((subject) => subject.id);
          setSelectedSubjectIds(subjectIds);
          setFilter(subjectIds);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }

    fetchSubjects();
  }, [theme.colors.primaryBlue, setFilter]);

  const toggleSubject = useCallback(
    (subjectId: number) => {
      setSelectedSubjectIds((prevSelected) => {
        let newSelection;
        if (prevSelected.includes(subjectId)) {
          newSelection = prevSelected.filter((s) => s !== subjectId);
        } else {
          newSelection = [...prevSelected, subjectId];
        }

        setFilter(newSelection);
        return newSelection;
      });
    },
    [setFilter]
  );

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const accordionItems: AccordionItem[] = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
  }));

  return (
    <Accordion
      title="Subjects"
      items={accordionItems}
      selectedItems={selectedSubjectIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleSubject}
    />
  );
}
