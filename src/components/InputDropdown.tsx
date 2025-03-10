import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

export type Option = { name: string; id: number };

interface InputDropdownProps {
  label: string;
  type: 'location' | 'subject';
  onChange: (value: Option | null) => void;
}

export const InputDropdown: React.FC<InputDropdownProps> = ({
  label,
  type,
  onChange,
}) => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    setIsOpen(false);
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => {
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
      onClose={() => setIsOpen(false)}
    >
      <PopoverTrigger>
        <InputGroup>
          <Input
            ref={inputRef}
            cursor="pointer"
            textAlign="left"
            pr="2.5rem"
            placeholder={`Please select ${label}`}
            value={selectedOption ? selectedOption.name : ''}
            readOnly
          />
          <InputRightElement pointerEvents="none">
            {isOpen ? <IoChevronUp /> : <IoChevronDown />}
          </InputRightElement>
        </InputGroup>
      </PopoverTrigger>

      <PopoverContent width="300px" borderRadius="md" overflow="hidden">
        <PopoverArrow />
        <PopoverBody p={0}>
          {options.map((option) => (
            <Box
              key={option.id}
              onClick={() => handleOptionSelect(option)}
              sx={{
                padding: '10px 16px',
                cursor: 'pointer',
                bg: 'transparent',
                _hover: { bg: 'neutralGray.100' },
              }}
            >
              <Text textStyle="subtitle">{option.name}</Text>
            </Box>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
