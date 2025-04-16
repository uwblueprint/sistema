import { ColorGroup, Location } from '@utils/types';
import EntityTable from './EntityTable';

interface LocationsTableProps {
  locations: Location[];
  locationsInUse: number[];
  handleUpdateLocation: (location: Location | null, id?: number) => void;
  maxAbbreviationLength: number;
  colorGroups: ColorGroup[];
}

const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  locationsInUse,
  handleUpdateLocation,
  maxAbbreviationLength,
  colorGroups,
}) => {
  return (
    <EntityTable
      title="Location"
      entityType="location"
      items={locations}
      itemsInUse={locationsInUse}
      handleUpdateEntity={handleUpdateLocation}
      maxAbbreviationLength={maxAbbreviationLength}
      colorGroups={colorGroups}
    />
  );
};

export default LocationsTable;
