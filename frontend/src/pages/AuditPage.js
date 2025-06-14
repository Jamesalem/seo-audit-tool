// src/pages/AuditPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import UrlForm from '../components/UrlForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportSummary from '../components/ReportSummary';
import ReportView from '../components/ReportView';
import PdfDownload from '../components/PdfDownload';

export default function AuditPage() {
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [aiSummary, setAiSummary] = useState('');

  // Run the audit
  const runAudit = async (url) => {
    setLoading(true);
    setAiSummary('');
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error(res.statusText);

      const { report_id, categories, audits } = await res.json();
      setReportId(report_id);
      setReportData({ categories, audits });
    } catch (err) {
      console.error('Audit failed:', err);
      alert('Failed to run audit. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  // AI interpretation when reportData changes
  useEffect(() => {
    if (!reportData) return;
    fetch('/api/interpret', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    })
      .then(res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(({ summary }) => setAiSummary(summary))
      .catch(err => {
        console.error('Interpretation failed:', err);
        setAiSummary('Failed to generate AI summary.');
      });
  }, [reportData]);

  const resetAudit = () => {
    setReportData(null);
    setReportId(null);
    setAiSummary('');
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" my={4}>
        SEO Audit Tool
      </Typography>

      {!reportData && <UrlForm onSubmit={runAudit} />}
      {loading && <LoadingSpinner />}

      {reportData && (
        <>
          <ReportSummary data={reportData} />

          {aiSummary && (
            <Box my={4} component="div">
              <Typography variant="h6">AI-Powered Insights</Typography>
              <Typography>{aiSummary}</Typography>
            </Box>
          )}

          <ReportView data={reportData} />
          <PdfDownload reportId={reportId} />

          {/* Nav link to run another audit */}
          <Box mt={2}>
            <Button variant="text" onClick={resetAudit}>
              Run another audit
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
