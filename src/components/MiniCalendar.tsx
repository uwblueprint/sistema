'use client';

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
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';

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
  const bgColor = useColorModeValue('white', 'gray.800');
  const todayBgColor = useColorModeValue('blue.500', 'blue.200');
  const todayColor = useColorModeValue('white', 'gray.800');
  const selectedBgColor = useColorModeValue('blue.100', 'blue.700');

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
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) =>
    selectedDate?.toDateString() === date.toDateString();

  return (
    <Box width="100%" p={0} bg={bgColor}>
      <VStack spacing={1} justifyContent="space-between" align="stretch">
        <HStack
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          ml="2"
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
              borderRadius="full"
              p={0}
            >
              <ChevronUpIcon boxSize={8} />
            </Button>
            <Button
              onClick={handleNextMonth}
              size="sm"
              variant="ghost"
              aria-label="Next month"
              borderRadius="full"
              p={0}
            >
              <ChevronDownIcon boxSize={8} />
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
          {days.map((day) => (
            <Button
              key={day}
              w="100%"
              size="sm"
              variant="ghost"
              pointerEvents="none"
              fontSize="sm"
              fontWeight="normal"
            >
              {day}
            </Button>
          ))}
        </Grid>

        <Grid
          templateColumns="repeat(7, 1fr)"
          gap={1}
          width="100%"
          justifyItems="center"
        >
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <Button
              key={`prev-${index}`}
              disabled
              size="sm"
              w="100%"
              variant="ghost"
              fontSize="xs"
              fontWeight="normal"
            >
              {lastDateOfPrevMonth - firstDayOfMonth + index + 1}
            </Button>
          ))}

          {Array.from({ length: daysInMonth }).map((_, index) => {
            const date = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              index + 1
            );
            return (
              <Button
                key={index}
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
                color={
                  isToday(date)
                    ? todayColor
                    : isSelected(date)
                      ? 'darkblue'
                      : 'inherit'
                }
                fontSize="xs"
                fontWeight="normal"
                borderRadius="50%"
                _hover={{
                  bg: isToday(date) ? todayBgColor : selectedBgColor,
                }}
              >
                {index + 1}
              </Button>
            );
          })}

          {Array.from({
            length: 42 - (firstDayOfMonth + daysInMonth),
          }).map((_, index) => (
            <Button
              key={`next-${index}`}
              disabled
              w="100%"
              size="sm"
              variant="ghost"
              fontSize="xs"
              color="gray.400"
              fontWeight="normal"
            >
              {index + 1}
            </Button>
          ))}
        </Grid>
      </VStack>
    </Box>
  );
}
