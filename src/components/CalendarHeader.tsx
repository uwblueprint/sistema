import React from 'react';
import {
  ButtonGroup,
  Button,
  IconButton,
  Flex,
  Heading,
  useTheme,
} from '@chakra-ui/react';
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  CalendarIcon,
} from '@chakra-ui/icons';

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
      <ButtonGroup isAttached variant="outline">
        <IconButton
          colorScheme="blue"
          onClick={onPrevClick}
          icon={<ArrowBackIcon />}
          aria-label="Previous"
        />
        <Button
          onClick={onTodayClick}
          variant="outline"
          colorScheme="blue"
          leftIcon={<CalendarIcon />}
        >
          Today
        </Button>
        <IconButton
          colorScheme="blue"
          onClick={onNextClick}
          icon={<ArrowForwardIcon />}
          aria-label="Next"
        />
      </ButtonGroup>
      <Heading fontSize="xl" textAlign="center" marginX={theme.space[6]}>
        {currentMonthYear}
      </Heading>
    </Flex>
  );
};

export default CalendarHeader;
