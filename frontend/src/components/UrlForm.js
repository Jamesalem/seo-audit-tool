import React from 'react';
import { TextField, Button, Box } from '@mui/material';

function UrlForm({ onSubmit }) {
  const [url, setUrl] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url) onSubmit(url);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} my={2}>
      <TextField
        label="Enter URL"
        variant="outlined"
        fullWidth
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com"
        required
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Run Audit
      </Button>
    </Box>
  );
}

export default UrlForm;
