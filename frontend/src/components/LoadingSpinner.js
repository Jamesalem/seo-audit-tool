import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function LoadingSpinner() {
  return (
    <Box textAlign="center" my={4}>
      <CircularProgress />
      <Typography variant="body1" mt={2}>Running audit...</Typography>
    </Box>
  );
}

export default LoadingSpinner;
