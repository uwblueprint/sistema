import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  Text,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';

export type Option = { name: string; id: number };

interface DropdownProps {
  label: string;
  type: 'location' | 'subject';
  onChange: (value: Option | null) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  type,
  onChange,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/formDropdown');
      if (res.ok) {
        const data = await res.json();

        if (type === 'location') {
          setOptions(data.locationOptions);
        } else if (type === 'subject') {
          setOptions(data.subjectOptions);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${type} options:`, error);
    }
  }, [type]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOptionSelect = (option: Option) => {
    setSelectedOption(option);
    onChange(option);
  };

  return (
    <Menu offset={[0, 2]}>
      <InputGroup>
        <Input as={MenuButton} textAlign="left" pr="2.5rem">
          <Text fontSize="14px" color={selectedOption ? 'black' : 'gray.500'}>
            {selectedOption ? selectedOption.name : `Please select ${label}`}
          </Text>
        </Input>
        {/* Dropdown Arrow */}
        <InputRightElement pointerEvents="none">
          <ChevronDownIcon />
        </InputRightElement>
      </InputGroup>

      <MenuList rootProps={{ width: '100%' }} p={0}>
        {options.map((option) => (
          <MenuItem
            fontSize="14px"
            width="100%"
            key={option.id}
            onClick={() => handleOptionSelect(option)}
            sx={{ padding: '10px 16px' }}
          >
            <Box>
              <Text color="gray.500">{option.name}</Text>
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
