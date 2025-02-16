import React from 'react';
import {
  HStack,
  Button,
  IconButton,
  Flex,
  Heading,
  useTheme,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

interface CalendarHeaderProps {
  currentMonthYear: string;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonthYear,
  onTodayClick,
  onPrevClick,
  onNextClick,
}) => {
  const theme = useTheme();
  return (
    <Flex marginBottom={theme.space[4]} alignItems="center">
      <HStack spacing={2}>
        <IconButton
          colorScheme="blue"
          onClick={onPrevClick}
          icon={<ChevronLeftIcon boxSize={6} color="neutralGray.600" />}
          aria-label="Previous"
          variant="outline"
        />
        <Button
          onClick={onTodayClick}
          variant="outline"
          colorScheme="blue"
          paddingX="20px"
        >
          Today
        </Button>
        <IconButton
          colorScheme="blue"
          onClick={onNextClick}
          icon={<ChevronRightIcon boxSize={6} color="neutralGray.600" />}
          aria-label="Next"
          variant="outline"
        />
      </HStack>

      <Heading fontSize="2xl" textAlign="center" marginX={theme.space[6]}>
        {currentMonthYear}
      </Heading>
    </Flex>
  );
};

export default CalendarHeader;
