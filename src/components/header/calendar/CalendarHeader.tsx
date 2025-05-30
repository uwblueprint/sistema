import {
  Button,
  Flex,
  HStack,
  IconButton,
  Spacer,
  Text,
  useTheme,
} from '@chakra-ui/react';
import { UserData } from '@utils/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { IoChevronBack, IoChevronForward, IoStatsChart } from 'react-icons/io5';
import { useCustomToast } from '../../CustomToast';
import ProfileMenu from '../profile/ProfileMenu';
import { AdminTeacherToggle } from './AdminTeacherToggle';

interface CalendarHeaderProps {
  currentMonthYear: string;
  onTodayClick: () => void;
  onPrevClick: () => void;
  onNextClick: () => void;
  userData?: UserData;
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  onToggleSidebar: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentMonthYear,
  onTodayClick,
  onPrevClick,
  onNextClick,
  userData,
  isAdminMode,
  setIsAdminMode,
  onToggleSidebar,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [absenceCap, setAbsenceCap] = useState<number>(10);
  const showToast = useCustomToast();
  const toastRef = useRef(showToast);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/settings');

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error
          ? `Failed to fetch settings: ${errorData.error}`
          : `Failed to fetch settings: ${response.statusText || 'Unknown error'}`;

        console.error(errorMessage);
        toastRef.current({
          description: errorMessage,
          status: 'error',
        });
        return;
      }

      const data = await response.json();
      setAbsenceCap(data.absenceCap);
    } catch (error: any) {
      const errorMessage = error?.message
        ? `Failed to fetch settings: ${error.message}`
        : 'Failed to fetch settings.';
      console.error(errorMessage, error);
      toastRef.current({
        description: errorMessage,
        status: 'error',
      });
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const isAdmin = userData?.role === 'ADMIN';

  return (
    <Flex
      pl={{ base: theme.space[4], md: theme.space[2] }}
      marginBottom={theme.space[4]}
      alignItems="center"
      width="100%"
      gap={theme.space[2]}
      overflowX="auto"
    >
      <HStack spacing={theme.space[6]}>
        <IconButton
          icon={<FiMenu size={20} color={theme.colors.neutralGray[600]} />}
          aria-label="Open sidebar"
          onClick={onToggleSidebar}
          display={{ base: 'inline-flex', md: 'none' }}
          variant="outline"
          h="45px"
          px="6px"
          borderRadius="md"
        />
        <HStack spacing={1}>
          <IconButton
            onClick={onPrevClick}
            icon={
              <IoChevronBack size={24} color={theme.colors.neutralGray[600]} />
            }
            aria-label="Previous"
            variant="outline"
            h="45px"
          />
          <Button
            onClick={onTodayClick}
            variant="outline"
            paddingX="20px"
            h="45px"
          >
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
            h="45px"
          />
        </HStack>
        <Text textStyle="h1" whiteSpace="nowrap" overflow="hidden">
          {currentMonthYear}
        </Text>
      </HStack>
      <Spacer />
      <HStack spacing={theme.space[4]} mr={theme.space[6]}>
        {isAdmin && (
          <>
            {isAdminMode && (
              <Button
                leftIcon={
                  <IoStatsChart
                    size={20}
                    color={theme.colors.primaryBlue[300]}
                  />
                }
                variant="outline"
                onClick={() => router.push('/dashboard')}
                h="45px"
              >
                Admin Dashboard
              </Button>
            )}
            <AdminTeacherToggle
              isAdminMode={isAdminMode}
              onToggle={(mode) => setIsAdminMode(mode === 'admin')}
            />
          </>
        )}
        <ProfileMenu userData={userData} absenceCap={absenceCap} />
      </HStack>
    </Flex>
  );
};

export default CalendarHeader;
