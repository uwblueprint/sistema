import {
  Flex,
  HStack,
  IconButton,
  Spacer,
  Text,
  useTheme,
  useDisclosure,
} from '@chakra-ui/react';
import { UserData } from '@utils/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoChevronBack, IoSettingsOutline } from 'react-icons/io5';
import ExportAbsencesButton from './ExportAbsencesButton';
import ProfileMenu from './ProfileMenu';
import YearDropdown from './YearDropdown';
import SystemOptionsModal from './SystemOptionsModal';

interface DashboardHeaderProps {
  userData?: UserData;
  selectedYearRange: string;
  setSelectedYearRange: (yearRange: string) => void;
  yearRanges: string[];
  hasData: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userData,
  selectedYearRange,
  setSelectedYearRange,
  yearRanges,
  hasData,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const [absenceCap, setAbsenceCap] = useState<number>(10);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setAbsenceCap(data.absenceCap);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <Flex
      alignItems="center"
      width="100%"
      borderBottom="1px solid"
      borderColor="neutralGray.300"
      px={theme.space[16]}
      py={theme.space[4]}
    >
      <HStack spacing={theme.space[8]}>
        <IconButton
          aria-label="Go back"
          icon={
            <IoChevronBack size={24} color={theme.colors.primaryBlue[300]} />
          }
          variant="outline"
          onClick={() => router.push('/calendar?isAdminMode=true')}
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
      <HStack spacing={theme.space[4]}>
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
              color={theme.colors.primaryBlue[300]}
            />
          }
          variant="outline"
          onClick={onOpen}
        />
        <ExportAbsencesButton />
        <ProfileMenu userData={userData} absenceCap={absenceCap} />
      </HStack>

      <SystemOptionsModal
        isOpen={isOpen}
        onClose={onClose}
        absenceCap={absenceCap}
      />
    </Flex>
  );
};

export default DashboardHeader;
