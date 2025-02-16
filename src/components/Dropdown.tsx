'use client';

import React from 'react';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@chakra-ui/icons';

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
    <Box width="100%" p={0}>
      <Button
        onClick={toggleOpen}
        width="100%"
        variant="outline"
        border={0}
        p={0}
        _hover={{ bg: 'none' }}
        _focus={{ bg: 'none', boxShadow: 'none', outline: 'none' }}
        _active={{ bg: 'none' }}
      >
        <Flex justify="space-between" align="center" width="100%">
          <Text fontWeight="semibold" fontSize="14px">
            {title}
          </Text>
          {/* <Text fontFamily="Poppins" fontSize="14px" fontWeight="medium" color="#1B1B1B">
                {title}
               </Text> */}
          {isOpen ? (
            <ChevronUpIcon boxSize="2.0em" p={0} m={0} />
          ) : (
            <ChevronDownIcon boxSize="2.0em" p={0} m={0} />
          )}
        </Flex>
      </Button>
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
                  bg={selectedItems.includes(item.name) ? item.color : 'white'}
                  border={`2px solid ${item.color}`}
                  borderRadius="0"
                />
                {selectedItems.includes(item.name) && (
                  <Icon
                    as={CheckIcon}
                    position="absolute"
                    inset={0}
                    color="white"
                    w="20px"
                    h="20px"
                  />
                )}
              </Box>
              <Text fontSize="13px">{item.name}</Text>
            </Flex>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default Dropdown;
