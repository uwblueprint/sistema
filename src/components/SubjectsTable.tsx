import React from 'react';
import { SubjectAPI } from '@utils/types';
import EntityTable from './EntityTable';

interface SubjectsTableProps {
  subjects: SubjectAPI[];
  colorGroups: { id: number; name: string; colorCodes: string[] }[];
  subjectsInUse: number[];
  handleUpdateSubject: (subject: SubjectAPI | null, id?: number) => void;
  maxAbbreviationLength: number;
}

const SubjectsTable: React.FC<SubjectsTableProps> = ({
  subjects,
  colorGroups,
  subjectsInUse,
  handleUpdateSubject,
  maxAbbreviationLength,
}) => {
  return (
    <EntityTable
      title="Subject"
      entityType="subject"
      items={subjects}
      colorGroups={colorGroups}
      itemsInUse={subjectsInUse}
      handleUpdateEntity={handleUpdateSubject}
      maxAbbreviationLength={maxAbbreviationLength}
    />
  );
};

export default SubjectsTable;
