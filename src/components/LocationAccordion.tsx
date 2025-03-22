import { useTheme } from '@chakra-ui/react';
import type { Location } from '@utils/types';
import { useEffect, useState } from 'react';
import Accordion, { AccordionItem } from './Accordion';
interface LocationAccordionProps {
  setFilter: (location: number[]) => void;
}

interface LocationAccordionItem extends Location {
  color: string;
}

export default function LocationAccordion({
  setFilter,
}: LocationAccordionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [locations, setLocations] = useState<LocationAccordionItem[]>([]);
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

  const AccordionItems: AccordionItem[] = locations.map((location) => ({
    id: location.id,
    name: location.name,
    color: location.color,
  }));

  return (
    <Accordion
      title="Location"
      items={AccordionItems}
      selectedItems={selectedLocationIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleLocation}
    />
  );
}
