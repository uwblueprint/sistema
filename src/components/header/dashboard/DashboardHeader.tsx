import {
  Flex,
  HStack,
  IconButton,
  Spacer,
  Text,
  useDisclosure,
  useTheme,
} from '@chakra-ui/react';
import { UserData } from '@utils/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IoChevronBack, IoSettingsOutline } from 'react-icons/io5';
import { useCustomToast } from '../../CustomToast';
import SystemOptionsModal from '../../dashboard/system_options/SystemOptionsModal';
import ProfileMenu from '../profile/ProfileMenu';
import ExportAbsencesButton from './ExportAbsencesButton';
import YearDropdown from './YearDropdown';

interface DashboardHeaderProps {
  userData?: UserData;
  selectedYearRange: string;
  setSelectedYearRange: (yearRange: string) => void;
  yearRanges: string[];
  hasData: boolean;
  onSystemOptionsUpdate: () => void;
  setRefreshFunction?: (refreshFn: () => void) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userData,
  selectedYearRange,
  setSelectedYearRange,
  yearRanges,
  hasData,
  onSystemOptionsUpdate,
  setRefreshFunction,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [absenceCap, setAbsenceCap] = useState<number>(10);
  const { isOpen, onOpen, onClose } = useDisclosure();
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

  // Register our fetchSettings function with the parent component if needed
  useEffect(() => {
    if (setRefreshFunction) {
      setRefreshFunction(fetchSettings);
    }
  }, [setRefreshFunction, fetchSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings, onSystemOptionsUpdate]);

  return (
    <Flex
      alignItems="center"
      width="100%"
      borderBottom="1px solid"
      borderColor="neutralGray.300"
      px={theme.space[16]}
      py={theme.space[4]}
      gap={theme.space[2]}
      overflowX="auto"
    >
      <HStack spacing={theme.space[8]}>
        <IconButton
          aria-label="Go back"
          icon={
            <IoChevronBack size={24} color={theme.colors.primaryBlue[300]} />
          }
          variant="outline"
          onClick={() => router.push('/calendar?isAdminMode=true')}
          h="45px"
        />
        <Text
          textStyle="h1"
          flexShrink={0}
          whiteSpace="nowrap"
          overflow="hidden"
          textAlign="center"
        >
          Admin Dashboard
        </Text>
      </HStack>
      <Spacer />
      <HStack spacing={theme.space[5]}>
        {hasData && (
          <YearDropdown
            selectedRange={selectedYearRange}
            onChange={setSelectedYearRange}
            yearRanges={yearRanges}
          />
        )}

        <IconButton
          aria-label="System Options"
          icon={
            <IoSettingsOutline
              size={24}
              color={theme.colors.neutralGray[600]}
            />
          }
          variant="outline"
          onClick={onOpen}
          h="45px"
          w="45px"
        />
        {hasData && <ExportAbsencesButton selectedRange={selectedYearRange} />}
        <ProfileMenu userData={userData} absenceCap={absenceCap} />
      </HStack>

      <SystemOptionsModal
        isOpen={isOpen}
        onClose={onClose}
        absenceCap={absenceCap}
        onUpdateComplete={onSystemOptionsUpdate}
      />
    </Flex>
  );
};

export default DashboardHeader;
