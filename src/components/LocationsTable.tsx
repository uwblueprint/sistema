import React from 'react';
import { Location } from '@utils/types';
import EntityTable from './EntityTable';

interface LocationsTableProps {
  locations: Location[];
  locationsInUse: number[];
  handleUpdateLocation: (location: Location | null, id?: number) => void;
  maxAbbreviationLength: number;
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  locationsInUse,
  handleUpdateLocation,
  maxAbbreviationLength,
}) => {
  return (
    <EntityTable
      title="Location"
      entityType="location"
      items={locations}
      itemsInUse={locationsInUse}
      handleUpdateEntity={handleUpdateLocation}
      maxAbbreviationLength={maxAbbreviationLength}
    />
  );
};

export default LocationsTable;
