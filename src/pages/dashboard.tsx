import { Box, Flex } from '@chakra-ui/react';
import { useUserData } from '@utils/useUserData';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import UserManagementCard from '../components/UserManagementCard';

export default function DashboardPage() {
  const userData = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!userData.isLoading && !userData.isAuthenticated) {
      router.push('/');
    }
  }, [userData.isLoading, userData.isAuthenticated, router]);

  if (userData.isLoading || !userData.isAuthenticated) {
    return null;
  }

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <DashboardHeader userData={userData} />
      <Box px={8} py={3} flex="1" minHeight="0">
        <UserManagementCard />
      </Box>
    </Box>
  );
}
