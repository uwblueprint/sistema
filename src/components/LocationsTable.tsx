import React from 'react';
import { Location } from '@utils/types';
import { Change } from './SystemChangesConfirmationDialog';
import EntityTable from './EntityTable';

interface LocationsTableProps {
  locations: Location[];
  locationsInUse: number[];
  handleAddChange: (change: Change) => void;
  maxAbbreviationLength: number;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  locationsInUse,
  handleAddChange,
  maxAbbreviationLength,
}) => {
  return (
    <EntityTable
      title="Location"
      entityType="location"
      items={locations}
      itemsInUse={locationsInUse}
      handleAddChange={handleAddChange}
      maxAbbreviationLength={maxAbbreviationLength}
    />
  );
};

export default LocationsTable;
