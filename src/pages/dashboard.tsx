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

  const monthlyData = [
    { month: 'Sep', filled: 25, unfilled: 0 },
    { month: 'Oct', filled: 25, unfilled: 15 },
    { month: 'Nov', filled: 40, unfilled: 0 },
    { month: 'Dec', filled: 22, unfilled: 0 },
    { month: 'Jan', filled: 35, unfilled: 15 },
    { month: 'Feb', filled: 25, unfilled: 15 },
    { month: 'Mar', filled: 3, unfilled: 22 },
    { month: 'Apr', filled: 40, unfilled: 0 },
    { month: 'May', filled: 10, unfilled: 5 },
    { month: 'Jun', filled: 20, unfilled: 20 },
    { month: 'Jul', filled: 15, unfilled: 0 },
    { month: 'Aug', filled: 25, unfilled: 0 },
  ];

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
