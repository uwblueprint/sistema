import { useTheme } from '@chakra-ui/react';
import type { SubjectAPI } from '@utils/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCustomToast } from '../../CustomToast';
import Accordion, { AccordionItem } from './Accordion';

interface SubjectAccordionProps {
  setFilter: (subjects: number[]) => void;
}

export default function SubjectAccordion({ setFilter }: SubjectAccordionProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [subjects, setSubjects] = useState<AccordionItem[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);

  const showToast = useCustomToast();
  const showToastRef = useRef(showToast);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/filter/subjects?archived=false');

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
          showToastRef.current({ description: errorMessage, status: 'error' });
          return;
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
      } catch (error: any) {
        const errorMessage = error?.message
          ? `Failed to fetch subjects: ${error.message}`
          : 'Failed to fetch subjects.';
        console.error(errorMessage, error);
        showToastRef.current({ description: errorMessage, status: 'error' });
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
