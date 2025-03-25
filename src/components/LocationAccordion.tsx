import { useTheme } from '@chakra-ui/react';
import type { Location } from '@utils/types';
import { useEffect, useState } from 'react';
import Accordion, { AccordionItem } from './Accordion';

interface LocationAccordionProps {
  setFilter: (location: number[]) => void;
  showArchived: boolean;
}

interface LocationAccordionItem extends Location {
  color: string;
}

export default function LocationAccordion({
  setFilter,
  showArchived,
}: LocationAccordionProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [locations, setLocations] = useState<LocationAccordionItem[]>([]);
  const [allLocations, setAllLocations] = useState<LocationAccordionItem[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

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
            color: theme.colors.primaryBlue[300], // Use theme color
          }));
          setAllLocations(fetchedLocations);

          const visibleLocations = showArchived
            ? fetchedLocations
            : fetchedLocations.filter((location) => !location.archived);

          setLocations(visibleLocations);
          setSelectedLocationIds(
            visibleLocations.map((location) => location.id)
          );
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    fetchLocations();
  }, [theme.colors.primaryBlue, showArchived]);

  useEffect(() => {
    const visibleLocations = showArchived
      ? allLocations
      : allLocations.filter((location) => !location.archived);

    setLocations(visibleLocations);

    const newSelectedIds = selectedLocationIds.filter((id) =>
      visibleLocations.some((location) => location.id === id)
    );

    const newVisibleIds = visibleLocations
      .filter((location) => !selectedLocationIds.includes(location.id))
      .map((location) => location.id);

    setSelectedLocationIds([...newSelectedIds, ...newVisibleIds]);
    setFilter([...newSelectedIds, ...newVisibleIds]);
  }, [showArchived, allLocations]);

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
    archived: location.archived,
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
