import { SubjectAPI } from '@utils/types';
import { useEffect, useState, useCallback } from 'react';
import Accordion, { AccordionItem } from './Accordion';

interface SubjectAccordionProps {
  setFilter: (subjects: number[]) => void;
  showArchived: boolean;
}

interface SubjectItem {
  id: number;
  name: string;
  color: string;
  archived: boolean;
}

export default function SubjectAccordion({
  setFilter,
  showArchived,
}: SubjectAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [selectedSubjectsIds, setSelectedSubjectsIds] = useState<number[]>([]);
  const [allSubjects, setAllSubjects] = useState<SubjectItem[]>([]);

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
              archived: subject.archived,
            })
          );
          setAllSubjects(fetchedSubjects);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }

    fetchSubjects();
  }, []);

  useEffect(() => {
    const visibleSubjects = showArchived
      ? allSubjects
      : allSubjects.filter((subject) => !subject.archived);

    setSubjects(visibleSubjects);

    const newSelectedIds = selectedSubjectsIds.filter((id) =>
      visibleSubjects.some((subject) => subject.id === id)
    );

    const newVisibleIds = visibleSubjects
      .filter((subject) => !selectedSubjectsIds.includes(subject.id))
      .map((subject) => subject.id);

    const updatedSelection = [...newSelectedIds, ...newVisibleIds];

    if (
      updatedSelection.length !== selectedSubjectsIds.length ||
      !updatedSelection.every((id, idx) => id === selectedSubjectsIds[idx])
    ) {
      setSelectedSubjectsIds(updatedSelection);
      setFilter(updatedSelection);
    }
  }, [showArchived, allSubjects, selectedSubjectsIds, setFilter]);

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjectsIds((prevSelected) => {
      let newSelection;
      if (prevSelected.includes(subjectId)) {
        newSelection = prevSelected.filter((s) => s !== subjectId);
      } else {
        newSelection = [...prevSelected, subjectId];
      }

      if (
        newSelection.length !== prevSelected.length ||
        !newSelection.every((id, idx) => id === prevSelected[idx])
      ) {
        setFilter(newSelection);
      }

      return newSelection;
    });
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const accordionItems: AccordionItem[] = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
    archived: subject.archived,
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
