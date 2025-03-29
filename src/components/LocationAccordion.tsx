import { useTheme } from '@chakra-ui/react';
import type { Location } from '@utils/types';
import { useEffect, useState, useCallback } from 'react';
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
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [locations, setLocations] = useState<LocationAccordionItem[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/filter/locations?archived=false');
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        if (data.locations) {
          const fetchedLocations = data.locations.map((location: Location) => ({
            id: location.id,
            name: location.name,
            color: theme.colors.primaryBlue[300],
          }));

          setLocations(fetchedLocations);

          const allLocationIds = fetchedLocations.map(
            (location) => location.id
          );
          setSelectedLocationIds(allLocationIds);
          setFilter(allLocationIds);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    fetchLocations();
  }, [theme.colors.primaryBlue, setFilter]);

  useEffect(() => {
    setFilter(selectedLocationIds);
  }, [selectedLocationIds, setFilter]);

  const toggleLocation = useCallback(
    (locationId: number) => {
      setSelectedLocationIds((prevSelected) => {
        let newSelection;
        if (prevSelected.includes(locationId)) {
          newSelection = prevSelected.filter((s) => s !== locationId);
        } else {
          newSelection = [...prevSelected, locationId];
        }

        setFilter(newSelection);
        return newSelection;
      });
    },
    [setFilter]
  );

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const accordionItems: AccordionItem[] = locations.map((location) => ({
    id: location.id,
    name: location.name,
    color: location.color,
  }));

  return (
    <Accordion
      title="Location"
      items={accordionItems}
      selectedItems={selectedLocationIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleLocation}
    />
  );
}
