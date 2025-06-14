// src/components/ReportSummary.jsx
import React from 'react';
import { Box, Grid, Paper, Typography, LinearProgress } from '@mui/material';

/**
 * Extracts key metrics from the full Lighthouse JSON:
 * - Overall category scores
 * - First Contentful Paint (FCP)
 * - Largest Contentful Paint (LCP)
 * - Total Blocking Time (TBT)
 * - Cumulative Layout Shift (CLS)
 */
function ReportSummary({ data }) {
  const { categories = {}, audits = {} } = data;

  return (
    <Box my={4}>
      <Typography variant="h6" gutterBottom>
        Summary
      </Typography>
      <Grid container spacing={2}>
        {/* Category Scores */}
        {Object.entries(categories).map(([key, cat]) => (
          <Grid item xs={6} sm={3} key={key}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="subtitle2">{cat.title}</Typography>
              <Typography variant="h4">{Math.round(cat.score * 100)}%</Typography>
            </Paper>
          </Grid>
        ))}

        {/* Key Performance Audits */}
        {[
          'first-contentful-paint',
          'largest-contentful-paint',
          'total-blocking-time',
          'cumulative-layout-shift',
        ].map((id) => {
          const audit = audits[id];
          if (!audit) return null;
          const display = audit.displayValue
            ? audit.displayValue
            : audit.numericValue
            ? `${Math.round(audit.numericValue)}${audit.displayValue?.replace(/[0-9.]/g, '')}`
            : '—';

          return (
            <Grid item xs={6} sm={3} key={id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2">{audit.title}</Typography>
                <Typography variant="h5">{display}</Typography>
                {audit.score != null && (
                  <LinearProgress
                    variant="determinate"
                    value={audit.score * 100}
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default ReportSummary;
