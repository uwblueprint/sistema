import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Text,
  HStack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { IoChevronUp, IoChevronDown } from 'react-icons/io5';

interface CalendarProps {
  initialDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export default function MiniCalendar({
  initialDate = new Date(),
  onDateSelect,
}: CalendarProps) {
  const [mounted, setMounted] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const bgColor = useColorModeValue('white', 'neutralGray.800');
  const todayBgColor = useColorModeValue('primaryBlue.300', 'primaryBlue.200');
  const todayColor = useColorModeValue('white', 'neutralGray.800');
  const selectedBgColor = useColorModeValue(
    'primaryBlue.50',
    'primaryBlue.600'
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const lastDateOfPrevMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    0
  ).getDate();

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleDateClick = (date: Date) => {
    if (date.getMonth() !== currentMonth.getMonth()) {
      setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    }
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) =>
    selectedDate?.toDateString() === date.toDateString();
  const totalWeeksToDisplay = 6; // Always show 6 weeks in the grid
  const totalDaysToDisplay = totalWeeksToDisplay * 7; // 6 rows * 7 columns (days)

  return (
    <Box width="100%" p={0} bg={bgColor}>
      <VStack spacing={1} justifyContent="space-between" align="stretch">
        <HStack
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          pl="10px"
        >
          <Text fontSize="sm" fontWeight="bold" textAlign="left">
            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
          <HStack spacing={0}>
            <Button
              onClick={handlePrevMonth}
              size="sm"
              variant="ghost"
              aria-label="Previous month"
              p={0}
              bg="transparent"
              _hover={{
                bg: 'neutralGray.100',
                borderRadius: 'lg',
              }}
            >
              <IoChevronUp size={24} />
            </Button>
            <Button
              onClick={handleNextMonth}
              size="sm"
              variant="ghost"
              aria-label="Next month"
              p={0}
              bg="transparent"
              _hover={{
                bg: 'neutralGray.100',
                borderRadius: 'lg',
              }}
            >
              <IoChevronDown size={24} />
            </Button>
          </HStack>
        </HStack>

        <Grid
          templateColumns="repeat(7, 1fr)"
          gap={1}
          width="100%"
          justifyItems="center"
          alignItems="center"
        >
          {days.map((day, index) => (
            <Button
              key={`day-${index}`}
              w="100%"
              size="sm"
              variant="ghost"
              pointerEvents="none"
              bg="transparent"
            >
              <Text variant="subtitle">{day}</Text>
            </Button>
          ))}
        </Grid>

        <Grid
          templateColumns="repeat(7, 1fr)"
          gap={1}
          width="100%"
          justifyItems="center"
        >
          {Array.from({ length: firstDayOfMonth }).map((_, index) => {
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth() - 1,
              lastDateOfPrevMonth - firstDayOfMonth + index + 1
            );
            return (
              <Button
                key={`prev-${index}`}
                onClick={() => handleDateClick(date)}
                size="sm"
                w="100%"
                variant="ghost"
                borderRadius="50%"
                bg={
                  isToday(date)
                    ? todayBgColor
                    : isSelected(date)
                      ? selectedBgColor
                      : 'transparent'
                }
                _hover={{
                  bg: isToday(date) ? todayBgColor : 'neutralGray.100',
                }}
              >
                <Text
                  variant="subtitle"
                  color={isToday(date) ? todayColor : 'neutralGray.500'}
                >
                  {lastDateOfPrevMonth - firstDayOfMonth + index + 1}
                </Text>
              </Button>
            );
          })}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              index + 1
            );
            return (
              <Button
                key={`date-${index + 1}-${date.toDateString()}`}
                onClick={() => handleDateClick(date)}
                size="sm"
                variant={isToday(date) ? 'solid' : 'ghost'}
                w="100%"
                bg={
                  isToday(date)
                    ? todayBgColor
                    : isSelected(date)
                      ? selectedBgColor
                      : 'transparent'
                }
                borderRadius="50%"
                _hover={{
                  bg: isToday(date) ? todayBgColor : 'neutralGray.100',
                }}
              >
                <Text
                  variant="subtitle"
                  color={
                    isToday(date)
                      ? todayColor
                      : isSelected(date)
                        ? 'primaryBlue.300'
                        : 'inherit'
                  }
                >
                  {index + 1}
                </Text>
              </Button>
            );
          })}

          {Array.from({
            length: totalDaysToDisplay - (firstDayOfMonth + daysInMonth),
          }).map((_, index) => {
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth() + 1,
              index + 1
            );
            return (
              <Button
                key={`next-${index}`}
                onClick={() => handleDateClick(date)}
                w="100%"
                size="sm"
                variant="ghost"
                borderRadius="50%"
                bg={
                  isToday(date)
                    ? todayBgColor
                    : isSelected(date)
                      ? selectedBgColor
                      : 'transparent'
                }
                _hover={{
                  bg: isToday(date) ? todayBgColor : 'neutralGray.100',
                }}
              >
                <Text
                  variant="subtitle"
                  color={isToday(date) ? todayColor : 'neutralGray.500'}
                >
                  {index + 1}
                </Text>
              </Button>
            );
          })}
        </Grid>
      </VStack>
    </Box>
  );
}
