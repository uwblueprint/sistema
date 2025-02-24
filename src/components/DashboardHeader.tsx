import { Flex, Heading, IconButton, useTheme, Spacer } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';
import ExportAbsencesButton from './ExportAbsencesButton';

const DashboardHeader = () => {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Flex
      alignItems="center"
      padding={theme.space[4]}
      borderBottom="1px"
      borderColor="neutralGray.200"
      bg="white"
    >
      <IconButton
        aria-label="Go back"
        icon={<IoChevronBack size={24} color={theme.colors.primaryBlue[300]} />}
        variant="outline"
        onClick={() => router.push('/calendar')}
        marginLeft={theme.space[4]}
      />

      <Heading size="h1" flex="1" marginLeft={theme.space[3]}>
        Admin Dashboard
      </Heading>

      <Spacer />
      <ExportAbsencesButton />
    </Flex>
  );
};

export default DashboardHeader;
