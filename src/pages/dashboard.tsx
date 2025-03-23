import { Box, Flex, HStack, Spinner } from '@chakra-ui/react';
import { YearlyAbsenceData } from '@utils/types';
import { useUserData } from '@utils/useUserData';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import MonthlyAbsencesCard from '../components/MonthlyAbsencesCard';
import TotalAbsencesCard from '../components/TotalAbsencesCard';
import UserManagementCard from '../components/UserManagementCard';

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const userData = useUserData();
  const router = useRouter();

  const [selectedYearRange, setSelectedYearRange] = useState(
    `${currentYear - 1} - ${currentYear}`
  );
  const [absenceData, setAbsenceData] = useState<YearlyAbsenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startYear, endYear] = selectedYearRange.split(' - ');

  useEffect(() => {
    if (!userData.isLoading && !userData.isAuthenticated) {
      router.push('/');
    }
  }, [userData.isLoading, userData.isAuthenticated, router]);

  useEffect(() => {
    const fetchAbsenceDates = async (): Promise<void> => {
      try {
        const response = await fetch('/api/getAbsenceDates');
        if (!response.ok) throw new Error('Failed to fetch absence data');
        const data = await response.json();
        setAbsenceData(data.events);
      } catch (err) {
        console.error('Error fetching absences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsenceDates();
  }, []);

  if (userData.isLoading || !userData.isAuthenticated) {
    return null;
  }

  const selectedYearData = absenceData.find(
    (data) => data.yearRange === selectedYearRange
  );

  if (!selectedYearData) return null;

  const yearlyAbsencesFilled =
    selectedYearData?.yearlyData.reduce(
      (sum, month) => sum + month.filled,
      0
    ) ?? 0;

  const yearlyAbsencesUnfilled =
    selectedYearData?.yearlyData.reduce(
      (sum, month) => sum + month.unfilled,
      0
    ) ?? 0;

  const sortedYearRanges = absenceData
    .map((data) => data.yearRange)
    .sort((a, b) => {
      const startYearA = parseInt(a.split(' - ')[0], 10);
      const startYearB = parseInt(b.split(' - ')[0], 10);
      return startYearA - startYearB;
    });

  const highestMonthlyAbsence = Math.max(
    ...selectedYearData.yearlyData.map((month) => month.filled + month.unfilled)
  );

  const totalAbsenceCount = yearlyAbsencesFilled + yearlyAbsencesUnfilled;

  return (
    <Box>
      <DashboardHeader
        userData={userData}
        selectedYearRange={selectedYearRange}
        setSelectedYearRange={setSelectedYearRange}
        yearRanges={sortedYearRanges}
      />
      <Box px={8} pt={3} pb={8} justifyContent="center">
        {loading ? (
          <Flex
            height="calc(100vh - 100px)"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner size="xl" />
          </Flex>
        ) : (
          <>
            <HStack height="216px" mb="10px">
              <TotalAbsencesCard
                width="35%"
                filled={yearlyAbsencesFilled}
                total={totalAbsenceCount}
                startYear={startYear}
                endYear={endYear}
              />
              <MonthlyAbsencesCard
                width="65%"
                monthlyData={selectedYearData.yearlyData}
                highestMonthlyAbsence={highestMonthlyAbsence}
              />
            </HStack>
            <UserManagementCard />
          </>
        )}
      </Box>
    </Box>
  );
}
