import { useEffect, useState } from 'react';
import type { Location } from '@utils/types';
import Dropdown, { DropdownItem } from './Dropdown';
import { useTheme } from '@chakra-ui/react';
interface LocationDropdownProps {
  setFilter: (location: number[]) => void;
}

interface LocationItem extends Location {
  color: string;
}

export default function LocationDropdown({ setFilter }: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);
  const theme = useTheme();

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/filter/locations');
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        if (data.locations) {
          const fetchedLocations = data.locations.map((location: Location) => ({
            ...location,
            color: `${theme.colors.primaryBlue[300]}`,
          }));
          setLocations(fetchedLocations);
          setSelectedLocationIds(
            fetchedLocations.map((location) => location.id)
          );
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    fetchLocations();
  }, [theme.colors.primaryBlue]);

  useEffect(() => {
    setFilter(selectedLocationIds);
  }, [setFilter, selectedLocationIds]);

  const toggleLocation = (locationId: number) => {
    let newSelection: number[];
    if (selectedLocationIds.includes(locationId)) {
      newSelection = selectedLocationIds.filter((s) => s !== locationId);
    } else {
      newSelection = [...selectedLocationIds, locationId];
    }
    setSelectedLocationIds(newSelection);
    setFilter(newSelection);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const dropdownItems: DropdownItem[] = locations.map((location) => ({
    id: location.id,
    name: location.name,
    color: location.color,
  }));

  return (
    <Dropdown
      title="Location"
      items={dropdownItems}
      selectedItems={selectedLocationIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleLocation}
    />
  );
}
