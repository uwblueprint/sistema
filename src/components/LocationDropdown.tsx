'use client';

import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Flex,
  Box,
  Icon,
  Text,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon, CheckIcon } from '@chakra-ui/icons';
import * as React from 'react';

interface LocationDropdownProps {
  setFilter: (locations: string[]) => void;
}

const locations = [
  { name: 'Lambton Park', color: 'blue.700' },
  { name: 'Yorkwood', color: 'blue.700' },
  { name: 'St. Martin de Porres', color: 'blue.700' },
  { name: 'Parkdale', color: 'blue.700' },
];

export default function LocationDropdown({ setFilter }: LocationDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  // Initialize with all locations selected by default
  const [selectedLocations, setSelectedLocations] = React.useState<string[]>(
    locations.map((location) => location.name)
  );

  React.useEffect(() => {
    setFilter(selectedLocations);
  }, [setFilter, selectedLocations]);

  const toggleLocation = (location: string) => {
    let newSelection: string[];
    if (selectedLocations.includes(location)) {
      newSelection = selectedLocations.filter((s) => s !== location);
    } else {
      newSelection = [...selectedLocations, location];
    }
    setSelectedLocations(newSelection);
    setFilter(newSelection);
  };

  return (
    <Box width="100%" p={0}>
      <Menu
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        matchWidth
        closeOnSelect={false}
      >
        <MenuButton
          as={Button}
          width="100%"
          variant="outline"
          border={0}
          p={0}
          _hover={{ bg: 'none' }}
          _focus={{ bg: 'none', boxShadow: 'none', outline: 'none' }}
          _active={{ bg: 'none' }}
        >
          <Flex justify="space-between" align="center" width="100%">
            <Text fontWeight="semibold" fontSize="16px">
              Location
            </Text>
            {isOpen ? (
              <ChevronUpIcon boxSize="2.1em" p={0} m={0} />
            ) : (
              <ChevronDownIcon boxSize="2.1em" p={0} m={0} />
            )}
          </Flex>
        </MenuButton>
        <MenuList width="100%" border={0} boxShadow="none" m={0} p={0}>
          {locations.map((location) => (
            <MenuItem
              key={location.name}
              onClick={() => toggleLocation(location.name)}
              border={0}
              px={0}
              py={1}
            >
              <Flex alignItems="center" gap={2}>
                <Box position="relative" width="20px" height="20px">
                  <Box position="absolute" inset={0} bg={location.color} />
                  {selectedLocations.includes(location.name) && (
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
                <Text fontSize="14px">{location.name}</Text>
              </Flex>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
}
