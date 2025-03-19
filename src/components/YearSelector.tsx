'use client';

import React, { useState } from 'react';
import {
  Button,
  Flex,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
  useTheme,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { CalendarIcon } from './CalendarIcon';

interface YearSelectorProps {
  selectedRange?: string;
  onChange?: (range: string) => void;
  yearRanges: string[];
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  selectedRange,
  onChange,
  yearRanges,
}) => {
  const theme = useTheme();
  const [selected, setSelected] = useState(selectedRange || yearRanges[0]);

  const handleSelect = (range: string) => {
    setSelected(range);
    if (onChange) {
      onChange(range);
    }
  };

  return (
    <Menu offset={[0, 4]}>
      <MenuButton
        as={Button}
        bg={theme.colors.buttonBackground}
        border="1px solid"
        borderColor={theme.colors.neutralGray[300]}
        borderRadius="7px"
        py="11px"
        px="15px"
        width="207px"
        maxWidth="207px"
        _hover={{ bg: theme.colors.primaryBlue[50] }}
        _active={{ bg: theme.colors.primaryBlue[50] }}
      >
        <Flex alignItems="center" justifyContent="space-between" width="100%">
          <Icon as={CalendarIcon} />
          <Flex flex="1" justifyContent="center">
            <Text fontWeight="600" fontSize="16px" color="black">
              {selected}
            </Text>
          </Flex>
          <ChevronDownIcon width="21px" height="21px" color="black" />
        </Flex>
      </MenuButton>
      <MenuList
        p={0}
        borderRadius="md"
        boxShadow="md"
        width="207px"
        maxWidth="207px"
        minWidth="207px"
      >
        {yearRanges.map((range) => (
          <MenuItem
            key={range}
            onClick={() => handleSelect(range)}
            bg={theme.colors.buttonBackground}
            _hover={{ bg: theme.colors.primaryBlue[50] }}
            borderBottom="1px solid"
            borderColor={theme.colors.neutralGray[300]}
            px="16px"
            height="52px"
            width="100%"
          >
            <Text fontSize="14px" fontWeight="500">
              {range}
            </Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
