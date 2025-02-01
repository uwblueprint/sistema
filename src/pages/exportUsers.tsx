import React, { useState } from 'react';
import { Button, Box, Text } from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';

export default function ExportUsersPage() {
  const [error, setError] = useState<string | null>(null);

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',') + '\n';
    const rows = data
      .map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(',')
      )
      .join('\n');

    return headers + rows;
  };

  const handleDownload = async () => {
    try {
      setError(null);
      const response = await fetch('/api/users');

      if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
      }

      const data = await response.json();
      const csvData = convertToCSV(data);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'users.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('Failed to export users. Please try again.');
    }
  };

  return (
    <Box>
      <Button
        leftIcon={<DownloadIcon />}
        colorScheme="blue"
        variant="solid"
        onClick={handleDownload}
        _hover={{ bg: 'blue.600' }}
        _active={{ transform: 'scale(0.95)' }}
      >
        Export
      </Button>
      {error && (
        <Text color="red.500" mt={4} fontSize="sm">
          {error}
        </Text>
      )}
    </Box>
  );
}
