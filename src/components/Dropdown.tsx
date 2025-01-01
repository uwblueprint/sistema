import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  Text,
  Input,
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
    if (selectedOption && selectedOption.id === option.id) {
      setSelectedOption(null); // Unselect if clicking the same option
      onChange(null);
    } else {
      setSelectedOption(option);
      onChange(option);
    }
  };

  return (
    <Menu>
      <Input as={MenuButton} textAlign="left">
        <Text color={selectedOption ? 'black' : 'gray.500'}>
          {selectedOption ? selectedOption.name : `Please select ${label}`}
        </Text>
      </Input>
      <MenuList rootProps={{ width: '100%' }}>
        {options.map((option) => (
          <MenuItem
            width="100%"
            key={option.id}
            onClick={() => handleOptionSelect(option)}
          >
            <Box>
              <Text>{option.name}</Text>
            </Box>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
