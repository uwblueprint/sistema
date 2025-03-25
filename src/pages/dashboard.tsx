import { Box } from '@chakra-ui/react';
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
    <Box>
      <DashboardHeader userData={userData} />
      <Box px={8} pt={3} pb={8}>
        <UserManagementCard />
      </Box>
    </Box>
  );
}
