import { useTheme } from '@chakra-ui/react';
import type { Location } from '@utils/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCustomToast } from '../../CustomToast';
import Accordion, { AccordionItem } from './Accordion';

interface LocationAccordionProps {
  setFilter: (location: number[]) => void;
}

export default function LocationAccordion({
  setFilter,
}: LocationAccordionProps) {
  const theme = useTheme();
  const showToast = useCustomToast();
  const showToastRef = useRef(showToast);
  const [isOpen, setIsOpen] = useState(true);
  const [locations, setLocations] = useState<AccordionItem[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<number[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/filter/locations?archived=false');

        if (!response.ok) {
          let errorMessage = 'Failed to fetch locations: ';
          try {
            const errorData = await response.json();
            errorMessage +=
              errorData?.error || response.statusText || 'Unknown error';
          } catch {
            errorMessage += response.statusText || 'Unknown error';
          }
          console.error(errorMessage);
          showToastRef.current({ description: errorMessage, status: 'error' });
          return;
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
      } catch (error: any) {
        const errorMessage = error?.message
          ? `Failed to fetch locations: ${error.message}`
          : 'Failed to fetch locations.';
        console.error(errorMessage, error);
        showToastRef.current({ description: errorMessage, status: 'error' });
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
      title="Locations"
      items={accordionItems}
      selectedItems={selectedLocationIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleLocation}
    />
  );
}
