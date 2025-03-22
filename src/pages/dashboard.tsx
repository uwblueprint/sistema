import { Box, Flex, Spinner } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import UserManagementSection from '../components/UserManagementSection';
import { useUserData } from '@utils/useUserData';

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
    <Box>
      <DashboardHeader userData={userData} />
      <Box px={8} pt={3} pb={8}>
        <UserManagementSection />
      </Box>
    </Box>
  );
}
