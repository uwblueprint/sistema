import {
  Box,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Input,
  InputGroup,
  InputRightElement,
  useDisclosure,
  Text,
} from '@chakra-ui/react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useRef, useState } from 'react';

interface YearDropdownProps {
  selectedRange: string;
  onChange: (yearRange: string) => void;
  yearRanges: string[];
}

export default function YearDropdown({
  selectedRange,
  onChange,
  yearRanges,
}: YearDropdownProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectYear = (year: string) => {
    onChange(year);
    onClose();
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpen={() => {
        onOpen();
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
      onClose={onClose}
    >
      <PopoverTrigger>
        <InputGroup>
          <Input
            ref={inputRef}
            cursor="pointer"
            textAlign="left"
            pr="2.5rem"
            placeholder="Select Year"
            value={selectedRange}
            readOnly
          />
          <InputRightElement pointerEvents="none">
            {isOpen ? <IoChevronUp /> : <IoChevronDown />}
          </InputRightElement>
        </InputGroup>
      </PopoverTrigger>

      <PopoverContent width="200px" borderRadius="md" overflow="hidden">
        <PopoverArrow />
        <PopoverBody p={0}>
          {yearRanges.map((year) => (
            <Box
              key={year}
              onClick={() => handleSelectYear(year)}
              sx={{
                padding: '10px 16px',
                cursor: 'pointer',
                bg: 'transparent',
                _hover: { bg: 'neutralGray.100' },
              }}
            >
              <Text textStyle="subtitle">{year}</Text>
            </Box>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
