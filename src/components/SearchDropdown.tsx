import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Box,
  Menu,
  MenuList,
  MenuItem,
  Text,
  Input,
  useDisclosure,
} from '@chakra-ui/react';

export type Option = { name: string; id: number };

interface SearchDropdownProps {
  label: string;
  type: 'user';
  onChange: (value: Option | null) => void;
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  type,
  onChange,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onOpen();
  };

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/formDropdown');
      if (res.ok) {
        const data = await res.json();

        if (type === 'user') {
          setOptions(data.userOptions);
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

    onClose(); // Close dropdown when an option is selected
  };

  // Close dropdown if clicking outside menu or input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <Menu isOpen={isOpen} onClose={onClose}>
      <Input
        ref={inputRef}
        value={selectedOption ? selectedOption.name : searchQuery}
        onChange={handleSearchChange}
        textAlign="left"
        placeholder={`Search ${label}`}
      />
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
