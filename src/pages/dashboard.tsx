import { Box } from '@chakra-ui/react';
import DashboardHeader from '../components/DashboardHeader';
import UserManagementSection from '../components/UserManagementSection';
import useUserData from '@utils/useUserData';

export default function DashboardPage() {
  const userData = useUserData();

  return (
    <Box>
      <DashboardHeader userData={userData} />
      <Box px={8} pt={3} pb={8}>
        <UserManagementSection />
      </Box>
    </Box>
  );
}
