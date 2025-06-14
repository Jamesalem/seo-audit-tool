// src/components/PdfDownload.jsx
import React, { useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';

function PdfDownload({ reportId }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/report/${reportId}/pdf`);
      if (!res.ok) throw new Error(res.statusText);

      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      let filename = `seo-audit-report-${reportId}.pdf`;
      if (disposition?.includes('filename=')) {
        const match = disposition.match(/filename\*=UTF-8''(.+)$|filename="?([^";]+)"?/);
        if (match) filename = decodeURIComponent(match[1] || match[2]);
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box my={2}>
      <Button
        variant="outlined"
        onClick={handleDownload}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? 'Downloading...' : 'Download PDF Report'}
      </Button>
    </Box>
  );
}

export default PdfDownload;
