'use client';

import { useEffect, useState } from 'react';
import type { Location } from '../../app/api/filter/locations/route';
import Dropdown, { DropdownItem } from './Dropdown';

interface LocationDropdownProps {
  setFilter: (locations: string[]) => void;
}

interface LocationItem extends Location {
  color: string;
}

export default function LocationDropdown({ setFilter }: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/filter/locations');
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        if (data.locations) {
          const fetched = data.locations.map((loc: Location) => ({
            ...loc,
            color: '#0468C1',
          }));
          setLocations(fetched);
          setSelectedLocations(fetched.map((location) => location.name));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    fetchLocations();
  }, []);

  useEffect(() => {
    setFilter(selectedLocations);
  }, [setFilter, selectedLocations]);

  const toggleLocation = (location: string) => {
    let newSelection: string[];
    if (selectedLocations.includes(location)) {
      newSelection = selectedLocations.filter((s) => s !== location);
    } else {
      newSelection = [...selectedLocations, location];
    }
    setSelectedLocations(newSelection);
    setFilter(newSelection);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const dropdownItems: DropdownItem[] = locations.map((loc) => ({
    name: loc.name,
    color: loc.color,
  }));

  return (
    <Dropdown
      title="Location"
      items={dropdownItems}
      selectedItems={selectedLocations}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleLocation}
    />
  );
}
