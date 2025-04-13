import { useTheme } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import Accordion, { AccordionItem } from './Accordion';

interface AbsenceStatusAccordionProps {
  setFilter: (status: number[]) => void;
}

const FILLED_STATUS = 1;
const UNFILLED_STATUS = 0;

export default function AbsenceStatusAccordion({
  setFilter,
}: AbsenceStatusAccordionProps) {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedStatusIds, setSelectedStatusIds] = useState<number[]>([
    FILLED_STATUS,
    UNFILLED_STATUS,
  ]);

  useEffect(() => {
    setFilter(selectedStatusIds);
  }, [selectedStatusIds, setFilter]);

  const toggleStatus = useCallback(
    (statusId: number) => {
      setSelectedStatusIds((prevSelected) => {
        let newSelection;
        if (prevSelected.includes(statusId)) {
          newSelection = prevSelected.filter((s) => s !== statusId);
        } else {
          newSelection = [...prevSelected, statusId];
        }

        setFilter(newSelection);
        return newSelection;
      });
    },
    [setFilter]
  );

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const accordionItems: AccordionItem[] = [
    {
      id: UNFILLED_STATUS,
      name: 'Unfilled',
      color: theme.colors.primaryBlue[300],
    },
    {
      id: FILLED_STATUS,
      name: 'Filled',
      color: theme.colors.primaryBlue[300],
    },
  ];

  return (
    <Accordion
      title="Absence Status"
      items={accordionItems}
      selectedItems={selectedStatusIds}
      isOpen={isOpen}
      toggleOpen={toggleOpen}
      toggleItem={toggleStatus}
    />
  );
}
