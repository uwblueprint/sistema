import { Box, Button, Text } from '@chakra-ui/react';
import { getSelectedYearAbsences } from '@utils/getSelectedYearAbsences';
import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';

const ExportAbsencesButton = ({ selectedRange }: { selectedRange: string }) => {
  const [error, setError] = useState<string | null>(null);

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers =
      [
        'Lesson Date',
        'Subject',
        'Lesson Plan',
        'Reason of Absence',
        'Notes',
        'Absent Teacher',
        'Substitute Teacher',
        'Location',
      ].join(',') + '\n';

    const rows = data
      .map((absence) => {
        return [
          absence.lessonDate,
          absence.subject?.name || '',
          absence.lessonPlan?.url || '',
          absence.reasonOfAbsence,
          absence.notes || '',
          `${absence.absentTeacher.firstName} ${absence.absentTeacher.lastName}`,
          absence.substituteTeacher
            ? `${absence.substituteTeacher.firstName} ${absence.substituteTeacher.lastName}`
            : '',
          absence.location?.name || '',
        ]
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(',');
      })
      .join('\n');

    return headers + rows;
  };

  const getFilteredAbsences = (
    absences: { lessonDate: string }[],
    selectedRange: string
  ) => {
    return absences
      .filter(
        (absence) => getSelectedYearAbsences([absence], selectedRange) > 0
      )
      .sort(
        (a, b) =>
          new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime()
      );
  };

  const handleDownload = async () => {
    try {
      setError(null);
      const response = await fetch('/api/getAbsences');

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }

      const data = await response.json();
      const filteredAbsences = getFilteredAbsences(data.events, selectedRange);

      const csvData = convertToCSV(filteredAbsences);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .split('.')[0];

      const sanitizedRange = selectedRange.replace(/ /g, '').replace('-', '_');

      link.href = url;
      link.download = `absences_${sanitizedRange}_generated_at_${timestamp}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('Failed to export absences. Please try again.');
    }
  };

  return (
    <Box>
      <Button
        leftIcon={<FiDownload size={18} />}
        variant="solid"
        onClick={handleDownload}
        height="45px"
      >
        Export
      </Button>
      {error && (
        <Text color="errorRed.200" mt={2} fontSize="sm">
          {error}
        </Text>
      )}
    </Box>
  );
};

export default ExportAbsencesButton;
