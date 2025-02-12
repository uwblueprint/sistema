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
import React, { useEffect, useState } from 'react';
import { Location } from '../../app/api/filter/locations/route';

interface LocationDropdownProps {
  setFilter: (locations: string[]) => void;
}

interface LocationItem extends Location {
  color: string;
}

export default function LocationDropdown({ setFilter }: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    locations.map((location) => location.name)
  );

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch('/api/filter/locations');
        if (!response.ok) {
          throw new Error('Failed to fetch locations');
        }
        const data = await response.json();
        if (data.locations) {
          const fetched = data.locations.map((loc: Location) => ({
            ...loc,
            color: 'blue.600',
          }));
          setLocations(fetched);
          setSelectedLocations(fetched.map((location) => location.name));
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    }

    fetchLocations();
  }, []);

  useEffect(() => {
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
        <MenuList
          width="100%"
          border={0}
          boxShadow="none"
          m={0}
          p={0}
          minWidth="240px"
        >
          {locations.map((location) => (
            <MenuItem
              key={location.name}
              onClick={() => toggleLocation(location.name)}
              px={0}
              py={1}
            >
              <Flex alignItems="center" gap={2}>
                <Box position="relative" width="20px" height="20px">
                  <Box
                    position="absolute"
                    inset={0}
                    bg={
                      selectedLocations.includes(location.name)
                        ? location.color
                        : 'white'
                    }
                    border={`2px solid #2B6CB0`}
                    borderRadius="0"
                  />
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
