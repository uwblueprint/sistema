import { Box, HStack } from '@chakra-ui/react';
import { useUserData } from '@hooks/useUserData';
import { Role, YearlyAbsenceData } from '@utils/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import MonthlyAbsencesCard from '../components/MonthlyAbsencesCard';
import TotalAbsencesCard from '../components/TotalAbsencesCard';
import UserManagementCard from '../components/UserManagementCard';

export default function DashboardPage() {
  const userData = useUserData();
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [selectedYearRange, setSelectedYearRange] = useState(
    `${currentYear - 1} - ${currentYear}`
  );
  const [absenceData, setAbsenceData] = useState<YearlyAbsenceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startYear, endYear] = selectedYearRange.split(' - ');

  // We'll use a ref to store the refresh function that will be created in UserManagementCard
  const userManagementRefreshRef = useRef<() => void>(() => {
    console.log('UserManagement refresh function not set yet');
  });

  // To handle header refreshes (for absenceCap updates)
  const dashboardHeaderRefreshRef = useRef<() => void>(() => {
    console.log('DashboardHeader refresh function not set yet');
  });

  // Function to refresh user management data - called when system options are updated
  const handleSystemOptionsUpdate = useCallback(() => {
    console.log('System options updated, refreshing user data and settings');
    // Call the refresh function stored in the ref to refresh user data
    userManagementRefreshRef.current();
    // Also refresh the dashboard header data
    dashboardHeaderRefreshRef.current();
  }, []);

  // Function to set the refresh function from UserManagementCard
  const setUserManagementRefresh = useCallback((refreshFn: () => void) => {
    userManagementRefreshRef.current = refreshFn;
  }, []);

  // Function to set the refresh function from DashboardHeader
  const setDashboardHeaderRefresh = useCallback((refreshFn: () => void) => {
    dashboardHeaderRefreshRef.current = refreshFn;
  }, []);

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

        if (events.length > 0 && !selectedYearRange) {
          setSelectedYearRange(events[0].yearRange);
        }
      } catch (err) {
        console.error('Error fetching absences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAbsenceDates();
  }, [selectedYearRange]);

  if (userData.isLoading) {
    return null;
  }

  if (!userData.isAuthenticated || userData.role !== Role.ADMIN) {
    router.push('/');
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

  const yearlyData = selectedYearData?.yearlyData ?? emptyYearlyData;

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
  const hasAbsenceData = absenceData.some(
    (data) =>
      data.yearRange === selectedYearRange &&
      data.yearlyData.some((month) => month.filled > 0 || month.unfilled > 0)
  );

  return (
    <Box height="100vh" display="flex" flexDirection="column">
      <DashboardHeader
        userData={userData}
        selectedYearRange={selectedYearRange}
        setSelectedYearRange={setSelectedYearRange}
        yearRanges={sortedYearRanges}
        hasData={hasAbsenceData}
        onSystemOptionsUpdate={handleSystemOptionsUpdate}
        setRefreshFunction={setDashboardHeaderRefresh}
      />
      <Box
        px={14}
        py={3}
        display="flex"
        flexDirection="column"
        flex="1"
        minHeight="0"
      >
        <HStack mb={3} spacing={3} height="215px">
          <TotalAbsencesCard
            width="40%"
            filled={yearlyAbsencesFilled}
            total={totalAbsenceCount}
            startYear={startYear}
            endYear={endYear}
          />
          <MonthlyAbsencesCard
            width="60%"
            monthlyData={selectedYearData.yearlyData}
            highestMonthlyAbsence={highestMonthlyAbsence}
          />
        </HStack>
        <UserManagementCard setRefreshFunction={setUserManagementRefresh} />
      </Box>
    </Box>
  );
}
