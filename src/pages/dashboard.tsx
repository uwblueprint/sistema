import DashboardHeader from '../components/DashboardHeader';
import UserManagementSection from '../components/UserManagementSection';
import TotalAbsencesModal from '../components/TotalAbsencesModal';
import MonthlyAbsencesModal from '../components/MonthlyAbsencesModal';
import { HStack, Flex, Box, Spinner } from '@chakra-ui/react';
import useUserData from '@utils/useUserData';
import { useState, useEffect } from 'react';
import { YearlyAbsenceData } from '@utils/types';

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const userData = useUserData();
  const [selectedYearRange, setSelectedYearRange] = useState(
    `${currentYear - 1} - ${currentYear}`
  );
  const [absenceData, setAbsenceData] = useState<YearlyAbsenceData[]>([]);
  const [startYear, endYear] = selectedYearRange.split('-');
  const [loading, setLoading] = useState(true);

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

  const selectedYearData = absenceData.find(
    (data) => data.yearRange === selectedYearRange
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

  console.log('Sorted Year Ranges:', sortedYearRanges);

  const totalAbsenceCount = yearlyAbsencesUnfilled + yearlyAbsencesFilled;

  const monthlyData = selectedYearData ? selectedYearData.yearlyData : [];

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
              <TotalAbsencesModal
                width="35%"
                filled={yearlyAbsencesFilled}
                total={totalAbsenceCount}
                startYear={startYear}
                endYear={endYear}
              />
              <MonthlyAbsencesModal
                width="65%"
                monthlyData={monthlyData}
                highestAbsencesCount={totalAbsenceCount} // FIX THIS
              />
            </HStack>
            <UserManagementSection />
          </>
        )}
      </Box>
    </Box>
  );
}
