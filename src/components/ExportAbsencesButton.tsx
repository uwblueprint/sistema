import { Button, Text, Box } from '@chakra-ui/react';
import { FiDownload } from 'react-icons/fi';
import { useState } from 'react';

const ExportAbsencesButton = () => {
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
          absence.lessonPlan || '',
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

  const handleDownload = async () => {
    try {
      setError(null);
      const response = await fetch('/api/getAbsences');

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }

      const data = await response.json();
      const csvData = convertToCSV(data.events);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const now = new Date();
      const timestamp = now
        .toISOString()
        .replace(/T/, '_')
        .replace(/:/g, '-')
        .split('.')[0];

      link.href = url;
      link.download = `absences_${timestamp}.csv`;
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
      >
        Export
      </Button>
      {error && (
        <Text color="red.500" mt={2} fontSize="sm">
          {error}
        </Text>
      )}
    </Box>
  );
};

export default ExportAbsencesButton;
