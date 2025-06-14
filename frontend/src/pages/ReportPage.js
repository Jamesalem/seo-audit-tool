// src/pages/ReportPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Container, Typography, Box, Button } from '@mui/material';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportSummary from '../components/ReportSummary';
import ReportView from '../components/ReportView';
import PdfDownload from '../components/PdfDownload';

export default function ReportPage() {
  const { reportId } = useParams();
  const [loading, setLoading]   = useState(true);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetch(`/api/report/${reportId}`)
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(data => setReportData(data))
      .catch(err => {
        console.error('Failed to load report:', err);
        alert('Could not load report.');
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) return <LoadingSpinner />;
  if (!reportData) return null;

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Button component={RouterLink} to="/" variant="text">
          ← Run a new audit
        </Button>

        <Typography variant="h4" gutterBottom>
          Report: {reportId}
        </Typography>

        <ReportSummary data={reportData} />
        <ReportView data={reportData} />
        <PdfDownload reportId={reportId} />
      </Box>
    </Container>
  );
}
