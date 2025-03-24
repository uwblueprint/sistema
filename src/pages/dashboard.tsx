import { Box, HStack } from '@chakra-ui/react';
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

        const events = data.events || [];
        setAbsenceData(events);

        if (
          events.length > 0 &&
          !events.find((entry) => entry.yearRange === selectedYearRange)
        ) {
          setSelectedYearRange(events[0].yearRange);
        }
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
  const emptyYearlyData = Array.from({ length: 12 }, (_, i) => ({
    month: [
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
    ][i],
    filled: 0,
    unfilled: 0,
  }));

  const selectedYearData = absenceData.find(
    (data) => data.yearRange === selectedYearRange
  ) ?? {
    yearRange: selectedYearRange,
    yearlyData: emptyYearlyData,
  };

  const yearlyData = selectedYearData?.yearlyData ?? [];

  const highestMonthlyAbsence = Math.max(
    ...yearlyData.map((month) => month.filled + month.unfilled),
    0
  );

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

  const totalAbsenceCount = yearlyAbsencesFilled + yearlyAbsencesUnfilled;

  return (
    <Box>
      <DashboardHeader
        userData={userData}
        selectedYearRange={selectedYearRange}
        setSelectedYearRange={setSelectedYearRange}
        yearRanges={sortedYearRanges}
        hasData={!!selectedYearData}
      />
      <Box px={8} pt={3} pb={8} justifyContent="center">
        {loading ? null : (
          <>
            <HStack
              // height="216px"
              mb="10px"
            >
              <TotalAbsencesCard
                width="35%"
                filled={yearlyAbsencesFilled}
                total={totalAbsenceCount}
                startYear={startYear}
                endYear={endYear}
              />
              {totalAbsenceCount}
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
