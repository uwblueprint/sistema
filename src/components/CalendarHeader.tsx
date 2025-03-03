import {
  Button,
  Flex,
  Text,
  HStack,
  IconButton,
  Spacer,
  useTheme,
} from '@chakra-ui/react';

import ProfileMenu from './ProfileMenu';

interface UserData {
  name: string;
  email: string;
  image?: string;
  usedAbsences: number;
  numOfAbsences: number;
}
import { useRouter } from 'next/navigation';
import { IoChevronBack, IoChevronForward, IoStatsChart } from 'react-icons/io5';

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
  const router = useRouter();

  return (
    <Flex marginBottom={theme.space[4]} alignItems="center" width="100%">
      <HStack spacing={3}>
        <HStack spacing={1}>
          <IconButton
            onClick={onPrevClick}
            icon={
              <IoChevronBack size={24} color={theme.colors.neutralGray[600]} />
            }
            aria-label="Previous"
            variant="outline"
          />
          <Button onClick={onTodayClick} variant="outline" paddingX="20px">
            Today
          </Button>
          <IconButton
            onClick={onNextClick}
            icon={
              <IoChevronForward
                size={24}
                color={theme.colors.neutralGray[600]}
              />
            }
            aria-label="Next"
            variant="outline"
          />
        </HStack>
        <Text textStyle={'h1'}>{currentMonthYear}</Text>
      </HStack>
      <ProfileMenu userData={userData} />
      <Spacer />
      <Button
        mx={3}
        leftIcon={
          <IoStatsChart size={20} color={theme.colors.primaryBlue[300]} />
        }
        variant="outline"
        onClick={() => router.push('/dashboard')}
      >
        Admin Dashboard
      </Button>
    </Flex>
  );
};

export default CalendarHeader;
