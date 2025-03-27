import { useTheme } from '@chakra-ui/react';
import type { Location } from '@utils/types';
import { useEffect, useState, useCallback } from 'react';
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
            color: theme.colors.primaryBlue[300],
          }));
          setAllLocations(fetchedLocations);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    fetchLocations();
  }, [theme.colors.primaryBlue]);

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

    const updatedSelection = [...newSelectedIds, ...newVisibleIds];

    if (
      updatedSelection.length !== selectedLocationIds.length ||
      !updatedSelection.every((id, idx) => id === selectedLocationIds[idx])
    ) {
      setSelectedLocationIds(updatedSelection);
      setFilter(updatedSelection);
    }
  }, [showArchived, allLocations, selectedLocationIds, setFilter]);

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
    archived: location.archived,
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
