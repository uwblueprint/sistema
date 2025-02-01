import React, { useState } from 'react';

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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading CSV:', err);
      setError('Failed to export users. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <button
        onClick={handleDownload}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '46.36px',
          padding: '11.273px 15.031px',
          gap: '16px',
          backgroundColor: '#0468C1',
          color: '#FFFFFF',
          fontFamily: 'Poppins, sans-serif',
          fontSize: '16px',
          fontWeight: 600,
          border: '1px solid #D2D2D2',
          borderRadius: '7px',
          cursor: 'pointer',
          transition: 'background 0.2s ease-in-out, transform 0.1s',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0358A3')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0468C1')}
        onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
        onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="25"
          viewBox="0 0 26 25"
          fill="white"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3.7443 14.583C4.3196 14.583 4.78597 15.0494 4.78597 15.6247V19.7913C4.78597 20.0676 4.89572 20.3326 5.09107 20.5279C5.28642 20.7233 5.55137 20.833 5.82764 20.833H20.411C20.6872 20.833 20.9522 20.7233 21.1475 20.5279C21.3429 20.3326 21.4526 20.0676 21.4526 19.7913V15.6247C21.4526 15.0494 21.919 14.583 22.4943 14.583C23.0696 14.583 23.536 15.0494 23.536 15.6247V19.7913C23.536 20.6201 23.2067 21.415 22.6207 22.001C22.0346 22.5871 21.2398 22.9163 20.411 22.9163H5.82764C4.99883 22.9163 4.20398 22.5871 3.61793 22.001C3.03188 21.415 2.70264 20.6201 2.70264 19.7913V15.6247C2.70264 15.0494 3.16901 14.583 3.7443 14.583Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.17448 9.6801C7.58128 9.2733 8.24082 9.2733 8.64762 9.6801L13.1194 14.1519L17.5911 9.6801C17.9979 9.2733 18.6575 9.2733 19.0643 9.6801C19.4711 10.0869 19.4711 10.7464 19.0643 11.1532L13.856 16.3616C13.4492 16.7684 12.7896 16.7684 12.3828 16.3616L7.17448 11.1532C6.76769 10.7464 6.76769 10.0869 7.17448 9.6801Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.1193 2.08301C13.6946 2.08301 14.161 2.54938 14.161 3.12467V15.6247C14.161 16.2 13.6946 16.6663 13.1193 16.6663C12.544 16.6663 12.0776 16.2 12.0776 15.6247V3.12467C12.0776 2.54938 12.544 2.08301 13.1193 2.08301Z"
            fill="white"
          />
        </svg>

        {/* Export Text */}
        <span style={{ lineHeight: 'normal' }}>Export</span>
      </button>
      {error && (
        <p style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
          {error}
        </p>
      )}
    </div>
  );
}
