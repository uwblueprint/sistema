import { Box } from '@chakra-ui/react';
import DashboardHeader from '../components/DashboardHeader';
import UserManagementSection from '../components/UserManagementSection';

export default function DashboardPage() {
  return (
    <Box>
      <DashboardHeader />
      <Box px={8} pt={3} pb={8}>
        <UserManagementSection />
      </Box>
    </Box>
  );
}
