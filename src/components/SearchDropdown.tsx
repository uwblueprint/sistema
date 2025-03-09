import React, { useEffect, useState, useRef } from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  VStack,
  Box,
  Text,
  Input,
  useDisclosure,
} from '@chakra-ui/react';

export type Option = { name: string; id: number };

interface SearchDropdownProps {
  label: string;
  type: 'user';
  excludedId?: string;
  initialValue?: { id: number; name: string } | undefined;
  onChange: (value: Option | null) => void;
  options: Option[];
}

export const SearchDropdown: React.FC<SearchDropdownProps> = ({
  label,
  type,
  excludedId,
  initialValue,
  onChange,
  options,
}) => {
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { isOpen, onOpen, onClose } = useDisclosure();

  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim() === '') {
      setFilteredOptions([]);
      onClose();
    } else {
      let filtered = options.filter((option) =>
        option.name.toLowerCase().includes(value.toLowerCase())
      );

      if (excludedId) {
        filtered = filtered.filter(
          (option) => String(option.id) !== excludedId
        );
      }

      setFilteredOptions(filtered);
      onOpen();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  // Set initial value when component mounts or when initialValue/options change
  useEffect(() => {
    if (initialValue && initialValue.id) {
      const matchingOption = options.find(
        (option) => option.id === initialValue.id
      );

      if (matchingOption) {
        setSelectedOption(matchingOption);
        setSearchQuery(matchingOption.name);
      }
    }
  }, [initialValue, options]);

  const handleOptionSelect = (option: Option) => {
    // Only update if the selection has changed
    if (!selectedOption || selectedOption.id !== option.id) {
      setSelectedOption(option);
      setSearchQuery(option.name);
      onChange(option);
    }
    inputRef.current?.focus();
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
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
    <Box>
      <Popover
        isOpen={isOpen}
        onClose={onClose}
        placement="bottom-start"
        autoFocus={false}
      >
        <PopoverTrigger>
          <Input
            fontSize="14px"
            ref={inputRef}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder={`Search for ${label}`}
            onClick={() => searchQuery.trim() && onOpen()}
          />
        </PopoverTrigger>
        <PopoverContent
          ref={popoverRef}
          fontSize="14px"
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
          _focus={{ boxShadow: 'sm', outline: 'none' }}
          width={inputRef.current?.offsetWidth}
          mt="-5px"
        >
          <VStack align="stretch" spacing={0}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <Box
                  key={option.id}
                  sx={{ padding: '10px 16px' }}
                  _hover={{ bg: 'gray.100' }}
                  cursor="pointer"
                  onClick={() => handleOptionSelect(option)}
                >
                  <Text color="gray.500">{option.name}</Text>
                </Box>
              ))
            ) : (
              <Box sx={{ padding: '10px 16px' }}>
                <Text color="gray.500">No matches found</Text>
              </Box>
            )}
          </VStack>
        </PopoverContent>
      </Popover>
    </Box>
  );
};
