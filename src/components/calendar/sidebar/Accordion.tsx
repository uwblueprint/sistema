import { CheckIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  Stack,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useEffect, useRef, useState } from 'react';

export interface AccordionItem {
  id: number;
  name: string;
  color: string;
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
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [tooltipStates, setTooltipStates] = useState<boolean[]>([]);

  useEffect(() => {
    const newStates = textRefs.current.map((el) =>
      el ? el.scrollWidth > el.clientWidth : false
    );
    setTooltipStates(newStates);
  }, [items]);

  return (
    <Box width="100%">
      <Button
        onClick={toggleOpen}
        width="100%"
        variant="ghost"
        px={2}
        py={0}
        height="32px"
      >
        <Flex justify="space-between" align="center" width="100%">
          <Text textStyle="h4" color="text.body">
            {title}
          </Text>
          {isOpen ? (
            <IoChevronUp size={24} color="text.body" />
          ) : (
            <IoChevronDown size={24} color="text.body" />
          )}
        </Flex>
      </Button>
      <Box px={2} mt={2}>
        <Collapse in={isOpen} animateOpacity>
          <Stack spacing={2} mt={0}>
            {items.map((item, index) => {
              const needsTooltip = tooltipStates[index];

              return (
                <Flex
                  key={item.id}
                  align="center"
                  cursor="pointer"
                  onClick={() => toggleItem(item.id)}
                  width="100%"
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

                  <Tooltip
                    label={item.name}
                    placement="top"
                    openDelay={300}
                    isDisabled={!needsTooltip}
                    hasArrow
                    shouldWrapChildren
                  >
                    <Box flex="1" position="relative" overflow="hidden">
                      <Text
                        ref={(el) => {
                          textRefs.current[index] = el;
                        }}
                        textStyle="subtitle"
                        color="text.body"
                        width="200px"
                        whiteSpace="nowrap"
                        noOfLines={1}
                        pr="30px"
                      >
                        {item.name}
                      </Text>
                      <Box
                        position="absolute"
                        top="0"
                        right="0"
                        width="30px"
                        height="100%"
                        pointerEvents="none"
                        bgGradient="linear(to-r, transparent, white)"
                      />
                    </Box>
                  </Tooltip>
                </Flex>
              );
            })}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Accordion;
