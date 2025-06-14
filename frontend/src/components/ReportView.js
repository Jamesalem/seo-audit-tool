// src/components/ReportView.jsx
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';

function safeJsonStringify(obj, maxDepth = 3, maxLength = 100) {
  const seen = new WeakSet();
  const replacer = (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    if (Array.isArray(value) && value.length > maxLength) {
      return `[${value.length} items]`;
    }
    return value;
  };
  try {
    return JSON.stringify(obj, replacer, 2);
  } catch (e) {
    return `Error serializing JSON: ${e.message}`;
  }
}

function ReportView({ data }) {
  const { categories } = data;
  const [open, setOpen] = useState(false);
  const safeJson = useMemo(() => safeJsonStringify(data), [data]);

  return (
    <Box my={4}>
      <Typography variant="h6" gutterBottom>
        Score Summary
      </Typography>
      <Grid container spacing={2}>
        {Object.entries(categories).map(([key, { score, title }]) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="subtitle1">{title}</Typography>
                <Typography variant="h4">{Math.round(score * 100)}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={Math.round(score * 100)}
                  color={
                    Math.round(score * 100) >= 90
                      ? 'success'
                      : Math.round(score * 100) >= 50
                      ? 'warning'
                      : 'error'
                  }
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6">JSON Report Preview</Typography>
        <Button variant="outlined" onClick={() => setOpen(true)}>
          View Full JSON
        </Button>
      </Box>

      <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflow: 'auto' }}>
        <Typography
          component="pre"
          sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}
        >
          {safeJson}
        </Typography>
      </Paper>

      <Dialog fullWidth maxWidth="md" open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Full JSON Report</DialogTitle>
        <DialogContent>
          <Typography
            component="pre"
            sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace' }}
          >
            {JSON.stringify(data, null, 2)}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ReportView;
