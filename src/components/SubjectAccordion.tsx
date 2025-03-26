import { SubjectAPI } from '@utils/types';
import { useEffect, useState } from 'react';
import Accordion, { AccordionItem } from './Accordion';

interface SubjectAccordionProps {
  setFilter: (subjects: number[]) => void;
}

interface SubjectItem {
  id: number;
  name: string;
  color: string;
}

export default function SubjectAccordion({ setFilter }: SubjectAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectsIds, setSelectedSubjectsIds] = useState<number[]>([]);

  useEffect(() => {
    async function fetchSubjects() {
      try {
        const response = await fetch('/api/filter/subjects');
        if (!response.ok) {
          throw new Error('Failed to fetch subjects');
        }
        const data = await response.json();
        if (data.subjects) {
          const fetchedSubjects: SubjectItem[] = data.subjects.map(
            (subject: SubjectAPI) => ({
              id: subject.id,
              name: subject.name,
              color: subject.colorGroup.colorCodes[1],
            })
          );
          setSubjects(fetchedSubjects);
          setSelectedSubjectsIds(fetchedSubjects.map((subject) => subject.id));
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }

    fetchSubjects();
  }, []);

  useEffect(() => {
    setFilter(selectedSubjectsIds);
  }, [selectedSubjectsIds, setFilter]);

  const toggleSubject = (subjectId: number) => {
    let newSelection: number[];
    if (selectedSubjectsIds.includes(subjectId)) {
      newSelection = selectedSubjectsIds.filter((s) => s !== subjectId);
    } else {
      newSelection = [...selectedSubjectsIds, subjectId];
    }
    setSelectedSubjectsIds(newSelection);
    setFilter(newSelection);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const accordionItems: AccordionItem[] = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
  }));

  return (
    <Accordion
      title="Subject"
      items={accordionItems}
      selectedItems={selectedSubjectsIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleSubject}
    />
  );
}
