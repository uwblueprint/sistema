import React, { useEffect, useState } from 'react';
import Dropdown, { DropdownItem } from './Dropdown';

interface ArchivedDropdownProps {
  setFilter: (archives: number[]) => void;
  onArchivedToggle: (
    subjectsArchived: boolean,
    locationsArchived: boolean
  ) => void;
}

export default function ArchivedDropdown({
  setFilter,
  onArchivedToggle,
}: ArchivedDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedArchiveIds, setSelectedArchiveIds] = useState<number[]>([]);

  const archives = [
    { id: 0, name: 'Subjects' },
    { id: 1, name: 'Locations' },
  ];

  useEffect(() => {
    setFilter(selectedArchiveIds);

    const showArchivedSubjects = selectedArchiveIds.includes(0);
    const showArchivedLocations = selectedArchiveIds.includes(1);
    onArchivedToggle(showArchivedSubjects, showArchivedLocations);
  }, [selectedArchiveIds, setFilter, onArchivedToggle]);

  const toggleArchive = (archiveId: number) => {
    let newSelection: number[];
    if (selectedArchiveIds.includes(archiveId)) {
      newSelection = selectedArchiveIds.filter((s) => s !== archiveId);
    } else {
      newSelection = [...selectedArchiveIds, archiveId];
    }
    setSelectedArchiveIds(newSelection);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const dropdownItems: DropdownItem[] = archives.map((archive) => ({
    id: archive.id,
    name: archive.name,
    color: 'gray',
  }));

  return (
    <Dropdown
      title="Archived"
      items={dropdownItems}
      selectedItems={selectedArchiveIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleArchive}
    />
  );
}
