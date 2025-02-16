'use client';

import React, { useEffect, useState } from 'react';
import { SubjectWithColorGroup } from '../../app/api/filter/subjects/route';
import Dropdown, { DropdownItem } from './Dropdown';

interface SubjectDropdownProps {
  setFilter: (subjects: string[]) => void;
}

interface SubjectItem {
  id: number;
  name: string;
  color: string;
}

export default function SubjectDropdown({ setFilter }: SubjectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);

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
            (subj: SubjectWithColorGroup) => ({
              id: subj.id,
              name: subj.name,
              color: subj.colorGroup?.colorCodes?.[1] || 'blue.700',
            })
          );
          setSubjects(fetchedSubjects);

          // Optionally select all subjects by default
          setSelectedSubjects(fetchedSubjects.map((s) => s.name));
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    }

    fetchSubjects();
  }, []);

  useEffect(() => {
    setFilter(selectedSubjects);
  }, [setFilter, selectedSubjects]);

  const toggleSubject = (subject: string) => {
    let newSelection: string[];
    if (selectedSubjects.includes(subject)) {
      newSelection = selectedSubjects.filter((s) => s !== subject);
    } else {
      newSelection = [...selectedSubjects, subject];
    }
    setSelectedSubjects(newSelection);
    setFilter(newSelection);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const dropdownItems: DropdownItem[] = subjects.map((subject) => ({
    name: subject.name,
    color: subject.color,
  }));

  return (
    <Dropdown
      title="Subject"
      items={dropdownItems}
      selectedItems={selectedSubjects}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleSubject}
    />
  );
}
