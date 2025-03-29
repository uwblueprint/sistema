import {
  Box,
  Button,
  Divider,
  Flex,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useDisclosure,
  useTheme,
} from '@chakra-ui/react';
import { Calendar } from 'iconsax-react';
import { useRef } from 'react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';

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
          width="200px"
          _hover={{ bg: theme.colors.primaryBlue[50] }}
          _active={{ bg: theme.colors.primaryBlue[50] }}
        >
          <Flex alignItems="center" justifyContent="space-between" width="100%">
            <Calendar size={25} color={theme.colors.primaryBlue[300]} />
            <Flex flex="1" justifyContent="center">
              <Text textStyle="h3">{selectedRange}</Text>
            </Flex>
            {isOpen ? (
              <IoChevronUp size={14} color={theme.colors.icon} />
            ) : (
              <IoChevronDown size={14} color={theme.colors.icon} />
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
                  py: '10px',
                  px: '16px',
                  cursor: 'pointer',
                  bg: selectedRange === year ? 'primaryBlue.50' : 'transparent',
                  _hover: { bg: 'neutralGray.100' },
                  _active: { bg: 'neutralGray.300' },
                  textAlign: 'left',
                }}
              >
                <Text textStyle="h4" fontWeight={550}>
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
