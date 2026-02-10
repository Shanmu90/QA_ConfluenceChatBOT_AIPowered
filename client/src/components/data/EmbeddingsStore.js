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
  LinearProgress,
  Chip,
  Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

export default function EmbeddingsStore() {
  const [jsonInput, setJsonInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progress, setProgress] = useState(0);
  const [ingestionResult, setIngestionResult] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target.result);
          setJsonInput(JSON.stringify(json, null, 2));
          setError('');
        } catch (err) {
          setError('❌ Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePasteJson = (e) => {
    setJsonInput(e.target.value);
    setFileName('pasted-data.json');
  };

  const handleIngest = async () => {
    setError('');
    setSuccess('');
    setIngestionResult(null);

    if (!jsonInput.trim()) {
      setError('❌ Please provide JSON data');
      return;
    }

    try {
      const data = JSON.parse(jsonInput);
      setLoading(true);
      setProgress(0);

      // Simulate ingestion progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 30;
        });
      }, 500);

      // Send to backend for ingestion
      const response = await axios.post('http://localhost:3001/api/embeddings/ingest', {
        documents: Array.isArray(data) ? data : [data],
        batchSize: 10,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data.success) {
        setIngestionResult(response.data.data);
        setSuccess('✅ Data ingested successfully! Embeddings generated.');
      } else {
        setError('❌ ' + (response.data.error || 'Ingestion failed'));
      }
    } catch (err) {
      setError(
        '❌ ' +
        (err.response?.data?.error ||
          err.message ||
          'Error processing JSON')
      );
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUploadIcon /> Upload JSON File
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="json-file-input"
              />
              <label htmlFor="json-file-input" style={{ display: 'block' }}>
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ py: 2 }}
                  startIcon={<CloudUploadIcon />}
                >
                  Choose JSON File
                </Button>
              </label>
              {fileName && (
                <Chip label={fileName} color="primary" sx={{ mt: 2 }} />
              )}
            </Box>

            <Divider sx={{ my: 2 }}>OR</Divider>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Or paste JSON directly:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder={`[\n  {\n    "page_id": "7340033",\n    "page_title": "Test Plans",\n    "full_content_text": "..."\n  }\n]`}
              value={jsonInput}
              onChange={handlePasteJson}
              disabled={loading}
              variant="outlined"
              sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
            />
          </Paper>
        </Grid>

        {/* Instructions Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, backgroundColor: '#f0f7ff' }}>
            <Typography variant="h6" gutterBottom>
              📋 Instructions
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Step 1:</strong> Get JSON from Step 1 (Confluence converter)
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Step 2:</strong> Upload file or paste JSON here
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Step 3:</strong> Click "Generate Embeddings"
              </Typography>
              <Typography variant="body2">
                <strong>Step 4:</strong> Embeddings will be stored in MongoDB with indexes
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="textSecondary">
              <strong>What happens:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>JSON parsed and validated</li>
              <li>Mistral embeddings generated (1024 dimensions)</li>
              <li>Documents inserted into MongoDB</li>
              <li>BM25 index created for keyword search</li>
              <li>Vector index created for semantic search</li>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              💡 Each document will have embeddings generated via Mistral API
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Button */}
      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleIngest}
          disabled={loading || !jsonInput.trim()}
          fullWidth
          sx={{ py: 1.5 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Generating Embeddings...
            </>
          ) : (
            '✨ Generate Embeddings & Ingest to MongoDB'
          )}
        </Button>
      </Box>

      {/* Progress Bar */}
      {loading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
            Progress: {Math.round(progress)}%
          </Typography>
        </Box>
      )}

      {/* Error & Success */}
      {error && (
        <Alert severity="error" sx={{ mt: 3, borderRadius: 1 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 3, borderRadius: 1 }}>
          {success}
        </Alert>
      )}

      {/* Results */}
      {ingestionResult && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="success" /> Ingestion Results
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Documents Processed
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {ingestionResult.processedCount || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Failed
                  </Typography>
                  <Typography variant="h6" color="error">
                    {ingestionResult.failedCount || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Processing Time
                  </Typography>
                  <Typography variant="h6">
                    {ingestionResult.processingTime || 'N/A'} ms
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label="✓ Ready for Search"
                    color="success"
                    icon={<CheckCircleIcon />}
                  />
                </Box>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              ✅ Your data is now indexed in MongoDB! Go to Step 3 to start asking questions.
            </Alert>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
