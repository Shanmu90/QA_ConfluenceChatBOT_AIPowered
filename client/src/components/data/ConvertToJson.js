import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';

export default function ConvertToJson() {
  const [confluenceUrl, setConfluenceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonResult, setJsonResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleConvert = async () => {
    setError('');
    setSuccess('');
    setJsonResult(null);

    if (!confluenceUrl.trim()) {
      setError('❌ Please enter a Confluence page URL');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/api/confluence/convert-url', {
        url: confluenceUrl.trim()
      });

      if (response.data.success) {
        setJsonResult(response.data.data);
        setSuccess('✅ Page converted successfully!');
      } else {
        setError('❌ ' + (response.data.error || 'Failed to convert page'));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error ||
        err.message ||
        'Error converting Confluence URL';
      setError('❌ ' + errorMsg);
      console.error('Conversion error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setError('');
    setSuccess('');
    setJsonResult(null);
    setConfluenceUrl('');

    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/demo/sample-data');
      if (response.data.success) {
        setJsonResult(response.data.data);
        setSuccess('✅ Demo data loaded successfully! (No Confluence needed)');
      }
    } catch (err) {
      setError('❌ Error loading demo data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (jsonResult) {
      navigator.clipboard.writeText(JSON.stringify(jsonResult, null, 2));
      setSuccess('✅ JSON copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleDownloadJson = () => {
    if (jsonResult) {
      const element = document.createElement('a');
      const file = new Blob([JSON.stringify(jsonResult, null, 2)], {
        type: 'application/json'
      });
      element.href = URL.createObjectURL(file);
      element.download = `${jsonResult.page_id}-converted.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      setSuccess('✅ JSON downloaded!');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          🔄 Confluence URL to JSON Converter
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Paste a Confluence page URL to automatically extract and convert it to JSON format
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Confluence Page URL"
            placeholder="https://prishan90.atlassian.net/wiki/pages/7340033"
            value={confluenceUrl}
            onChange={(e) => setConfluenceUrl(e.target.value)}
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleConvert();
              }
            }}
            multiline
            rows={2}
            helperText="Example: https://prishan90.atlassian.net/wiki/pages/7340033"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConvert}
            disabled={loading || !confluenceUrl.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            size="large"
          >
            {loading ? 'Converting...' : 'Convert to JSON'}
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleLoadDemo}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            size="large"
          >
            📋 Load Demo Data (No Confluence Needed)
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setConfluenceUrl('');
              setJsonResult(null);
              setError('');
              setSuccess('');
            }}
            disabled={loading}
          >
            Clear
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 1 }}>
            {success}
          </Alert>
        )}

        {jsonResult && (
          <Box sx={{ mt: 4 }}>
            {/* Metadata Card */}
            <Card sx={{ mb: 3, backgroundColor: '#f9f9f9' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  📄 Extracted Metadata
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        PAGE ID
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {jsonResult.page_id}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        TITLE
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {jsonResult.page_title}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        STATUS
                      </Typography>
                      <Chip label={jsonResult.status} size="small" color="primary" />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        CREATED DATE
                      </Typography>
                      <Typography variant="subtitle2">
                        {new Date(jsonResult.created_date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">
                        CONTENT LENGTH
                      </Typography>
                      <Typography variant="subtitle2">
                        {jsonResult.content_length} characters
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  📋 Content Preview (first 500 characters):
                </Typography>
                <Box
                  sx={{
                    bgcolor: '#ffffff',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #e0e0e0',
                    maxHeight: 200,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {jsonResult.content_preview}
                </Box>
              </CardContent>
            </Card>

            {/* Full JSON Card */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  🗂️ Full JSON Output
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyJson}
                  >
                    Copy JSON
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadJson}
                  >
                    Download JSON
                  </Button>
                </Box>

                <Box
                  sx={{
                    bgcolor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid #ddd',
                    maxHeight: 500,
                    overflow: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all'
                  }}
                >
                  {JSON.stringify(jsonResult, null, 2)}
                </Box>
              </CardContent>
            </Card>

            {/* Usage Info */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0f7ff', borderRadius: 1, border: '1px solid #b3e5fc' }}>
              <Typography variant="body2" component="div" sx={{ mb: 1, fontWeight: 600 }}>
                💡 <strong>Next Steps:</strong>
              </Typography>
              <Box component="ul" sx={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                <li>Copy the JSON above</li>
                <li>Go to "Embeddings Store" to upload and process</li>
                <li>Generate embeddings using Mistral API</li>
                <li>Search using BM25, Vector, or Hybrid search</li>
              </Box>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
