'use client';

import React, { useEffect, useState } from 'react';
import { SubjectWithColorGroup } from '../../app/api/filter/subjects/route';
import Dropdown, { DropdownItem } from './Dropdown';

interface SubjectDropdownProps {
  setFilter: (subjects: number[]) => void;
}

interface SubjectItem {
  id: number;
  name: string;
  color: string;
}

export default function SubjectDropdown({ setFilter }: SubjectDropdownProps) {
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
            (subject: SubjectWithColorGroup) => ({
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
  }, [setFilter, selectedSubjectsIds]);

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

  const dropdownItems: DropdownItem[] = subjects.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: subject.color,
  }));

  return (
    <Dropdown
      title="Subject"
      items={dropdownItems}
      selectedItems={selectedSubjectsIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleSubject}
    />
  );
}
