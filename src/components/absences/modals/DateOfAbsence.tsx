import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import MiniCalendar from '../../calendar/MiniCalendar';

interface DateOfAbsenceProps {
  dateValue: Date;
  onDateSelect: (date: Date) => void;
  error?: string;
  label?: string;
}

const DATE_PATTERN = '^[0-9]{4}-[0-9]{2}-[0-9]{2}$';

export const DateOfAbsence: React.FC<DateOfAbsenceProps> = ({
  dateValue,
  onDateSelect,
  error,
  label = 'Date of Absence',
}) => {
  const [inputValue, setInputValue] = useState(
    dateValue ? dateValue.toLocaleDateString('en-CA') : ''
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (dateValue) {
      setInputValue(dateValue.toLocaleDateString('en-CA'));
    }
  }, [dateValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.trim();
      setInputValue(rawValue);

      if (new RegExp(DATE_PATTERN).test(rawValue)) {
        const parsedDate = new Date(rawValue);
        if (!isNaN(parsedDate.getTime())) {
          onDateSelect(parsedDate);
        }
      }
    },
    [onDateSelect]
  );

  const handleDateSelect = useCallback(
    (date: Date) => {
      const formattedDate = date.toLocaleDateString('en-CA');
      setInputValue(formattedDate);
      onDateSelect(date);
      setIsOpen(false);
    },
    [onDateSelect]
  );

  return (
    <FormControl isRequired isInvalid={!!error}>
      <FormLabel sx={{ display: 'flex' }}>
        <Text textStyle="h4">{label}</Text>
      </FormLabel>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        placement="bottom-start"
        isLazy
      >
        <PopoverTrigger>
          <Box>
            <Input
              value={inputValue}
              onChange={handleInputChange}
              placeholder="YYYY-MM-DD"
              onClick={() => setIsOpen(true)}
              pattern={DATE_PATTERN}
              title="Enter date in YYYY-MM-DD format"
              autoComplete="off"
            />
          </Box>
        </PopoverTrigger>
        <PopoverContent width="300px" p={2} boxShadow="lg">
          <MiniCalendar
            initialDate={dateValue}
            onDateSelect={handleDateSelect}
            selectDate={dateValue}
          />
        </PopoverContent>
      </Popover>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};
