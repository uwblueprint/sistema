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
  Button,
  Flex,
  useTheme,
  Divider,
} from '@chakra-ui/react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { useRef } from 'react';
import { CalendarIcon } from './CalendarIcon';

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
  const theme = useTheme();
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
        <Button
          bg={theme.colors.buttonBackground}
          border="1px solid"
          borderColor={theme.colors.neutralGray[300]}
          borderRadius="7px"
          py="11px"
          px="15px"
          height="40px"
          width="207px"
          maxWidth="207px"
          _hover={{ bg: theme.colors.primaryBlue[50] }}
          _active={{ bg: theme.colors.primaryBlue[50] }}
        >
          <Flex alignItems="center" justifyContent="space-between" width="100%">
            <CalendarIcon />
            <Flex flex="1" justifyContent="center">
              <Text fontWeight="600" fontSize="16px" color="black">
                {selectedRange}
              </Text>
            </Flex>
            {isOpen ? (
              <IoChevronUp size={21} color="black" />
            ) : (
              <IoChevronDown size={21} color="black" />
            )}
          </Flex>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        width="207px"
        borderRadius="md"
        overflow="hidden"
        border="1px solid"
        borderColor={theme.colors.neutralGray[300]}
      >
        <PopoverArrow />
        <PopoverBody p={0}>
          {yearRanges.map((year, index) => (
            <Box key={year}>
              <Box
                onClick={() => handleSelectYear(year)}
                sx={{
                  padding: '16px',
                  cursor: 'pointer',
                  bg: selectedRange === year ? 'primaryBlue.50' : 'transparent',
                  _hover: { bg: 'neutralGray.100' },
                  _active: { bg: 'neutralGray.300' },
                  textAlign: 'left',
                }}
              >
                <Text fontStyle="body" fontWeight="500">
                  {year}
                </Text>
              </Box>
              {index < yearRanges.length - 1 && (
                <Divider borderColor="neutralGray.300" opacity={1} />
              )}
            </Box>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
