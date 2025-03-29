import { CheckIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

export interface AccordionItem {
  id: number;
  name: string;
  color: string;
  subtitle?: string;
}

export interface AccordionProps {
  title: string;
  items: AccordionItem[];
  selectedItems: number[];
  isOpen: boolean;
  toggleOpen: () => void;
  toggleItem: (id: number) => void;
}

const Accordion = ({
  title,
  items,
  selectedItems,
  isOpen,
  toggleOpen,
  toggleItem,
}: AccordionProps) => {
  return (
    <Box width="100%">
      <Button
        onClick={toggleOpen}
        width="100%"
        variant="ghost"
        px={1}
        py={0}
        height="32px"
      >
        <Flex justify="space-between" align="center" width="100%">
          <Text textStyle="h4">{title}</Text>
          {isOpen ? <IoChevronUp size={24} /> : <IoChevronDown size={24} />}
        </Flex>
      </Button>
      <Box pl={1} mt={2}>
        <Collapse in={isOpen} animateOpacity>
          <Stack spacing={2} mt={0}>
            {items.map((item) => (
              <Box key={item.id}>
                {item.subtitle && (
                  <Text textStyle="subtitle" color="text.body" mb={2}>
                    {item.subtitle}
                  </Text>
                )}
                <Flex
                  align="center"
                  cursor="pointer"
                  onClick={() => toggleItem(item.id)}
                >
                  <Box
                    width="20px"
                    height="20px"
                    mr={2}
                    flexShrink={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="2px"
                    bg={selectedItems.includes(item.id) ? item.color : 'white'}
                    border={`2px solid ${item.color}`}
                  >
                    {selectedItems.includes(item.id) && (
                      <Icon as={CheckIcon} color="white" w="14px" h="14px" />
                    )}
                  </Box>
                  <Text textStyle="subtitle" color="text.body">
                    {item.name}
                  </Text>
                </Flex>
              </Box>
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Accordion;
