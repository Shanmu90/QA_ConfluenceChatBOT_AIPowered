import React, { useState } from 'react';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import DataVersusIcon from '@mui/icons-material/DataUsage';
import StorageIcon from '@mui/icons-material/Storage';
import ChatIcon from '@mui/icons-material/Chat';

import ConvertToJson from './components/data/ConvertToJson';
import EmbeddingsStore from './components/data/EmbeddingsStore';
import QAChatBot from './components/search/QAChatBot';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1',
    },
    secondary: {
      main: '#FF6F00',
    },
    success: {
      main: '#4CAF50',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 700,
    },
  },
});

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* Header */}
      <AppBar position="sticky" sx={{ backgroundColor: '#0D47A1' }}>
        <Toolbar>
          <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700 }}>
            🤖 QA ChatBot - RAG Pipeline
          </Typography>
          <Typography variant="body2" sx={{ color: '#90CAF9' }}>
            Confluence → MongoDB → AI Search
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Container */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Tabs Navigation */}
        <Paper sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            aria-label="RAG pipeline tabs"
          >
            <Tab
              label="📥 Step 1: Ingest Data"
              icon={<DataVersusIcon />}
              iconPosition="start"
              id="tab-0"
            />
            <Tab
              label="⚙️ Step 2: Generate Embeddings"
              icon={<StorageIcon />}
              iconPosition="start"
              id="tab-1"
            />
            <Tab
              label="💬 Step 3: QA ChatBot"
              icon={<ChatIcon />}
              iconPosition="start"
              id="tab-2"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}

        {/* Step 1: Data Ingestion */}
        <TabPanel value={activeTab} index={0}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              📥 Step 1: Convert Confluence URL to JSON
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              Convert Confluence pages into structured JSON data that can be ingested into MongoDB
            </Typography>
            <ConvertToJson />
          </Box>
        </TabPanel>

        {/* Step 2: Embeddings & Ingestion */}
        <TabPanel value={activeTab} index={1}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              ⚙️ Step 2: Upload JSON & Generate Embeddings
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              Upload JSON data and generate Mistral embeddings for vector search indexing in MongoDB
            </Typography>
            <EmbeddingsStore />
          </Box>
        </TabPanel>

        {/* Step 3: QA ChatBot */}
        <TabPanel value={activeTab} index={2}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
              💬 Step 3: Search & Get Answers
            </Typography>
            <Typography variant="body1" color="textSecondary" sx={{ mb: 2 }}>
              Ask questions about your documentation. The system searches using BM25 + Vector indexing and provides answers with sources.
            </Typography>
            <QAChatBot />
          </Box>
        </TabPanel>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: '#f5f5f5',
          py: 3,
          mt: 6,
          borderTop: '1px solid #ddd',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="textSecondary" align="center">
            QA ChatBot RAG Pipeline | Powered by Confluence + MongoDB + Mistral + Groq
          </Typography>
          <Typography variant="caption" color="textSecondary" align="center" sx={{ display: 'block', mt: 1 }}>
            Backend: http://localhost:3001 | Frontend: http://localhost:3000
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;

