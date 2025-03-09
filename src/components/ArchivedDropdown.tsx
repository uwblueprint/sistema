import React, { useEffect, useState, useCallback } from 'react';
import { SubjectAPI } from '@utils/types';
import Dropdown, { DropdownItem } from './Dropdown';
import { generateKey } from 'crypto';

interface SubjectDropdownProps {
  setFilter: (archives: number[]) => void;
}

export default function ArchivedDropdown({ setFilter }: SubjectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArchiveIds, setselectedArchiveIds] = useState<number[]>([]);

  const archives = [
    { id: 0, name: 'Subjects' },
    { id: 1, name: 'Locations' },
  ];

  useEffect(() => {
    setFilter(selectedArchiveIds);
  }, [setselectedArchiveIds, setFilter]);

  const toggleSubject = (archive: number) => {
    let newSelection: number[];
    if (selectedArchiveIds.includes(archive)) {
      newSelection = selectedArchiveIds.filter((s) => s !== archive);
    } else {
      newSelection = [...selectedArchiveIds, archive];
    }
    setselectedArchiveIds(newSelection);
    setFilter(newSelection);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const dropdownItems: DropdownItem[] = archives.map((subject) => ({
    id: subject.id,
    name: subject.name,
    color: 'gray',
  }));

  return (
    <Dropdown
      title="Archived"
      items={dropdownItems}
      selectedItems={selectedArchiveIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleSubject}
    />
  );
}
