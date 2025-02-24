import { Box } from '@chakra-ui/react';
import DashboardHeader from '../components/DashboardHeader';

export default function Dashboard() {
  return (
    <Box bg="neutralGray.50" minH="100vh">
      <DashboardHeader />
    </Box>
  );
}
