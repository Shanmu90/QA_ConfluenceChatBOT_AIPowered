import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Divider,
  Chip,
  Grid,
  ListItem,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import SourceIcon from '@mui/icons-material/Source';
import InfoIcon from '@mui/icons-material/Info';
import axios from 'axios';

const SAMPLE_QUESTIONS = [
  {
    question: 'What are the main test types for payment processing?',
    category: 'Test Strategy',
    description: 'Find test types and categories'
  },
  {
    question: 'What negative test cases should be covered?',
    category: 'Test Cases',
    description: 'List of negative scenarios to test'
  },
  {
    question: 'What are the security requirements?',
    category: 'Requirements',
    description: 'Security and compliance requirements'
  },
  {
    question: 'How do we handle payment failures?',
    category: 'Error Handling',
    description: 'Failure scenarios and recovery'
  },
  {
    question: 'What is the regression scope?',
    category: 'Regression',
    description: 'Areas to test during regression'
  },
  {
    question: 'What are the expected results for payment validation?',
    category: 'Test Cases',
    description: 'Expected outcomes and assertions'
  },
];

export default function QAChatBot() {
  const [conversations, setConversations] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setError('❌ Please enter a question');
      return;
    }

    setError('');
    const userMessage = {
      type: 'user',
      content: searchQuery,
      timestamp: new Date(),
    };

    setConversations((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // Call hybrid search with reranking
      const response = await axios.post('http://localhost:3001/api/search/hybrid', {
        query: searchQuery,
        topK: 5,
      });

      if (response.data.success && response.data.results) {
        const results = response.data.results;

        // Build response message with sources
        const botMessage = {
          type: 'bot',
          content: response.data.answer || formatSearchResults(results),
          results: results,
          timestamp: new Date(),
        };

        setConversations((prev) => [...prev, botMessage]);
      } else {
        const errorMsg = {
          type: 'bot',
          content: '❌ No matching documents found. Try a different question.',
          results: [],
          timestamp: new Date(),
        };
        setConversations((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      const errorMsg = {
        type: 'bot',
        content: `❌ Error: ${
          err.response?.data?.error || err.message || 'Search failed'
        }`,
        timestamp: new Date(),
      };
      setConversations((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSampleQuestion = (question) => {
    handleSearch(question);
  };

  const formatSearchResults = (results) => {
    if (!results || results.length === 0) {
      return 'No results found.';
    }

    return results
      .slice(0, 3)
      .map((r, i) => `${i + 1}. **${r.title || r.page_title}**\n${r.snippet || r.description || r.full_content_text?.substring(0, 200)}`)
      .join('\n\n');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Chat Area */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '600px', display: 'flex', flexDirection: 'column' }}>
            {/* Chat Messages */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                mb: 2,
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#888',
                  borderRadius: '10px',
                },
              }}
            >
              {conversations.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SearchIcon sx={{ fontSize: 48, color: 'action.disabled', mb: 2 }} />
                  <Typography color="textSecondary">
                    No messages yet. Ask a question to get started!
                  </Typography>
                </Box>
              ) : (
                conversations.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      mb: 2,
                      display: 'flex',
                      justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        maxWidth: '75%',
                        backgroundColor: msg.type === 'user' ? '#2196f3' : '#f5f5f5',
                        color: msg.type === 'user' ? 'white' : 'black',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body2">{msg.content}</Typography>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                        {msg.timestamp.toLocaleTimeString()}
                      </Typography>

                      {/* Display search results */}
                      {msg.results && msg.results.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                            📚 Sources:
                          </Typography>
                          {msg.results.slice(0, 3).map((result, i) => (
                            <Chip
                              key={i}
                              icon={<SourceIcon />}
                              label={result.page_title || result.title || `Source ${i + 1}`}
                              onClick={() => {
                                setSelectedResult(result);
                                setDetailsOpen(true);
                              }}
                              variant="outlined"
                              size="small"
                              sx={{ mr: 1, mt: 0.5 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Paper>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Input Area */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask a question about your QA documentation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch(query);
                  }
                }}
                disabled={loading}
                variant="outlined"
                size="small"
              />
              <Button
                variant="contained"
                onClick={() => handleSearch(query)}
                disabled={loading || !query.trim()}
                endIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {loading ? 'Searching...' : 'Ask'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Sample Questions Sidebar */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon /> Sample Questions
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Click any question to search:
            </Typography>

            <Box component="ul" sx={{ p: 0, pl: 1 }}>
              {SAMPLE_QUESTIONS.map((item, idx) => (
                <ListItem
                  key={idx}
                  sx={{ p: 0, mb: 1 }}
                  disablePadding
                >
                  <ListItemButton
                    onClick={() => handleSampleQuestion(item.question)}
                    disabled={loading}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: '#f5f5f5',
                      mb: 1,
                      '&:hover': {
                        backgroundColor: '#e3f2fd',
                      },
                      p: 1.5,
                    }}
                  >
                    <ListItemText
                      primary={item.question}
                      secondary={item.category}
                      primaryTypographyProps={{ variant: 'body2', sx: { fontWeight: 500 } }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </Box>

            <Alert severity="info" sx={{ mt: 3 }}>
              💡 These questions are examples. You can ask any question about your data!
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      {/* Details Modal */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          📄 {selectedResult?.page_title || selectedResult?.title || 'Document'}
        </DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Source
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {selectedResult.source_url || selectedResult.page_id}
                </Typography>
              </Box>

              {selectedResult.labels && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="textSecondary">
                    Labels
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {(Array.isArray(selectedResult.labels) ? selectedResult.labels : [selectedResult.labels]).map(
                      (label, i) => (
                        <Chip key={i} label={label} size="small" />
                      )
                    )}
                  </Box>
                </Box>
              )}

              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Content
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, maxHeight: 300, overflowY: 'auto' }}>
                  {selectedResult.full_content_text || selectedResult.description || selectedResult.snippet || 'No content available'}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedResult?.source_url && (
            <Button
              color="primary"
              href={selectedResult.source_url}
              target="_blank"
            >
              Open in Confluence
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
