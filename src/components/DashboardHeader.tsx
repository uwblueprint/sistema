import { Flex, Text, IconButton, useTheme, Spacer } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';
import ExportAbsencesButton from './ExportAbsencesButton';

const DashboardHeader = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Flex
      alignItems="center"
      py={theme.space[4]}
      px={theme.space[8]}
      borderBottom="1px"
      borderColor="neutralGray.200"
      bg="white"
    >
      <IconButton
        aria-label="Go back"
        icon={<IoChevronBack size={24} color={theme.colors.primaryBlue[300]} />}
        variant="outline"
        onClick={() => router.push('/calendar')}
      />

      <Text textStyle="h1" flex="1" marginLeft={theme.space[3]}>
        Admin Dashboard
      </Text>

      <Spacer />
      <ExportAbsencesButton />
    </Flex>
  );
};

export default DashboardHeader;
