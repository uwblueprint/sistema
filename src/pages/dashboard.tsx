import { Box } from '@chakra-ui/react';
import DashboardHeader from '../components/DashboardHeader';
import UserManagementSection from '../components/UserManagementSection';
import TotalAbsencesModal from '../components/TotalAbsencesModal';
import MonthlyAbsencesModal from '../components/MonthlyAbsencesModal';
import { HStack } from '@chakra-ui/react';
import useUserData from '@utils/useUserData';
import { useState } from 'react';

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const userData = useUserData();
  const [selectedYearRange, setSelectedYearRange] = useState(
    `${currentYear} - ${currentYear - 1}`
  );
  const [startYear, endYear] = selectedYearRange.split('-');

  return (
    <Box>
      <DashboardHeader
        userData={userData}
        selectedYearRange={selectedYearRange}
        setSelectedYearRange={setSelectedYearRange}
      />
      <Box px={8} pt={3} pb={8} justifyContent="center">
        <HStack height="216px" mb="10px">
          <TotalAbsencesModal
            width="35%"
            filled={180}
            total={200}
            startYear={startYear}
            endYear={endYear}
          />
          <MonthlyAbsencesModal width="65%" />
        </HStack>
        <UserManagementSection />
      </Box>
    </Box>
  );
}
