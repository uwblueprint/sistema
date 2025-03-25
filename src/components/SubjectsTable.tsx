import React from 'react';
import { SubjectAPI } from '@utils/types';
import { Change } from './SystemChangesConfirmationDialog';
import EntityTable from './EntityTable';

interface SubjectsTableProps {
  subjects: SubjectAPI[];
  colorGroups: { id: number; name: string; colorCodes: string[] }[];
  subjectsInUse: number[];
  handleAddChange: (change: Change) => void;
  maxAbbreviationLength: number;
}

const SubjectsTable: React.FC<SubjectsTableProps> = ({
  subjects,
  colorGroups,
  subjectsInUse,
  handleAddChange,
  maxAbbreviationLength,
}) => {
  return (
    <EntityTable
      title="Subject"
      entityType="subject"
      items={subjects}
      colorGroups={colorGroups}
      itemsInUse={subjectsInUse}
      handleAddChange={handleAddChange}
      maxAbbreviationLength={maxAbbreviationLength}
    />
  );
};

export default SubjectsTable;
