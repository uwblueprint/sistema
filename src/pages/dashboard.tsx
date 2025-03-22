import { Box, Flex, Spinner } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import UserManagementSection from '../components/UserManagementSection';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return null;
  }

  if (!session?.user) return null;

  return (
    <Box>
      <DashboardHeader userData={session.user} />
      <Box px={8} pt={3} pb={8}>
        <UserManagementSection />
      </Box>
    </Box>
  );
}
