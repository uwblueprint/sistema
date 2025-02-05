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
import ProfileMenu from './ProfileMenu';

// Example interface for userData; adjust fields as needed.
interface UserData {
  name: string;
  email: string;
  image?: string;
  usedAbsences: number; // e.g. 4
  numOfAbsences: number; // e.g. 10
}

interface CalendarHeaderProps {
  currentMonthYear: string;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  userData?: UserData;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonthYear,
  onTodayClick,
  onPrevClick,
  onNextClick,
  userData,
}) => {
  const theme = useTheme();

  return (
    <Flex
      marginBottom={theme.space[4]}
      alignItems="center"
      justifyContent="space-between"
    >
      {/* Left side: Prev/Today/Next buttons */}
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

      {/* Center: month-year heading */}
      <Heading fontSize="2xl" textAlign="center">
        {currentMonthYear}
      </Heading>

      {/* Right side: the new ProfileMenu component */}
      <ProfileMenu userData={userData} />
    </Flex>
  );
};

export default CalendarHeader;
