import { Box } from '@chakra-ui/react';
import DashboardHeader from '../components/DashboardHeader';
import UserManagementSection from '../components/UserManagementSection';
import TotalAbsencesModal from '../components/TotalAbsencesModal';
import MonthlyAbsencesModal from '../components/MonthlyAbsencesModal';
import { HStack } from '@chakra-ui/react';
import useUserData from '@utils/useUserData';

export default function DashboardPage() {
  const userData = useUserData();

  return (
    <Box>
      <DashboardHeader userData={userData} />
      <Box px={8} pt={3} pb={8} justifyContent="center">
        <HStack height="216px" mb="10px">
          <TotalAbsencesModal
            width="35%"
            filled={180}
            total={200}
            startDate="Sept 2024"
            endDate="Aug 2025"
          />
          <MonthlyAbsencesModal width="65%" />
        </HStack>
        <UserManagementSection />
      </Box>
    </Box>
  );
}
