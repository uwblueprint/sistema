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
import { CheckIcon } from '@chakra-ui/icons';
import React from 'react';

export interface DropdownItem {
  name: string;
  color: string;
}

export interface DropdownProps {
  title: string;
  items: DropdownItem[];
  selectedItems: string[];
  isOpen: boolean;
  toggleOpen: () => void;
  toggleItem: (name: string) => void;
}

const Dropdown = ({
  title,
  items,
  selectedItems,
  isOpen,
  toggleOpen,
  toggleItem,
}: DropdownProps) => {
  return (
    <Box width="100%">
      <Button onClick={toggleOpen} width="100%" variant="ghost" px={1}>
        <Flex justify="space-between" align="center" width="100%">
          <Text fontWeight="semibold" fontSize="14px">
            {title}
          </Text>
          {isOpen ? <IoChevronUp size={24} /> : <IoChevronDown size={24} />}
        </Flex>
      </Button>
      <Box pl={1} mt={2}>
        <Collapse in={isOpen} animateOpacity>
          <Stack spacing={2} mt={0}>
            {items.map((item) => (
              <Flex
                key={item.name}
                align="center"
                cursor="pointer"
                onClick={() => toggleItem(item.name)}
              >
                <Box position="relative" width="20px" height="20px" mr={2}>
                  <Box
                    position="absolute"
                    inset={0}
                    bg={
                      selectedItems.includes(item.name) ? item.color : 'white'
                    }
                    border={`2px solid ${item.color}`}
                    borderRadius="2px"
                  />
                  {selectedItems.includes(item.name) && (
                    <CheckIcon
                      position="absolute"
                      color="white"
                      w="20px"
                      h="20px"
                      sx={{ transform: 'scale(0.8, 0.8)' }}
                    />
                  )}
                </Box>
                <Text textStyle="subtitle" color="text.body">
                  {item.name}
                </Text>
              </Flex>
            ))}
          </Stack>
        </Collapse>
      </Box>
    </Box>
  );
};

export default Dropdown;
