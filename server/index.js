/**
 * QA ChatBot RAG Server
 * Express backend for RAG QA Chatbot
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';

// Import RAG components
import { preprocessQuery } from '../src/scripts/query-preprocessing/queryPreprocessor.js';
// import { bm25Search } from '../src/scripts/search/bm25-search.js';
// import { vectorSearch } from '../src/scripts/search/vector-search.js';
// import { hybridSearch } from '../src/scripts/search/hybrid-search.js';
// import { rerankingSearch } from '../src/scripts/search/rerank-search.js';
// import { executeRAGPipeline, quickSearch } from '../src/scripts/rag-pipeline.js';
// import { createEmbeddings, validateEmbeddings } from '../src/scripts/data-pipeline/create-embeddings.js';
// import { summarizeResults } from '../src/scripts/utilities/groqClient.js';
import logger from '../src/scripts/utilities/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'RAG QA ChatBot Server is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== DATABASE STATUS ENDPOINT ====================

app.get('/api/db/status', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      ssl: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });

    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);

    // Get document count
    const docCount = await collection.countDocuments();
    
    // Get index information
    const indexes = await collection.listIndexes().toArray();
    
    // Sample document
    const sampleDoc = await collection.findOne({});
    
    await client.close();

    res.json({
      success: true,
      database: process.env.DB_NAME,
      collection: process.env.COLLECTION_NAME,
      documentCount: docCount,
      indexes: indexes.map(idx => idx.name),
      hasSampleDocument: !!sampleDoc,
      sampleDocTitle: sampleDoc?.page_title || 'N/A'
    });
  } catch (error) {
    logger.error('❌ DB Status error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== PREPROCESSING ROUTES ====================

app.post('/api/preprocess', async (req, res) => {
  try {
    const { query, options } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = preprocessQuery(query, options);
    res.json(result);
  } catch (error) {
    logger.error('Preprocessing error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SEARCH ROUTES ====================
// All search functionality now consolidated in /api/search/hybrid endpoint below

app.post('/api/search/bm25', async (req, res) => {
  // Deprecated: Use /api/search/hybrid instead
  return res.status(400).json({ error: 'This endpoint is deprecated. Use /api/search/hybrid instead' });
});

app.post('/api/search/vector', async (req, res) => {
  // Deprecated: Use /api/search/hybrid instead
  return res.status(400).json({ error: 'This endpoint is deprecated. Use /api/search/hybrid instead' });
});

// Removed old endpoints - using new full hybrid search implementation below

app.post('/api/search/rerank', async (req, res) => {
  try {
    const { query, limit = 5, initialLimit = 15, weights = { bm25: 0.6, vector: 0.4 } } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Use the new hybrid search endpoint instead
    return res.status(400).json({ error: 'Use /api/search/hybrid endpoint instead' });
  } catch (error) {
    logger.error('Reranking search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== RAG PIPELINE ROUTES ====================

app.post('/api/rag', async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const result = await executeRAGPipeline(query, options);
    res.json(result);
  } catch (error) {
    logger.error('RAG pipeline error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== SUMMARIZATION ROUTE ====================

app.post('/api/summarize', async (req, res) => {
  try {
    const { query, documents } = req.body;
    
    if (!query || !documents) {
      return res.status(400).json({ error: 'Query and documents are required' });
    }

    const result = await summarizeResults(query, documents);
    res.json(result);
  } catch (error) {
    logger.error('Summarization error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DATA MANAGEMENT ROUTES ====================

app.post('/api/embeddings/create', async (req, res) => {
  try {
    const { documents, batchSize = 100 } = req.body;
    
    if (!documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: 'Documents array is required' });
    }

    const result = await createEmbeddings(documents, { batchSize });
    res.json(result);
  } catch (error) {
    logger.error('Embeddings creation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/embeddings/validate', async (req, res) => {
  try {
    const result = await validateEmbeddings();
    res.json(result);
  } catch (error) {
    logger.error('Embeddings validation error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      ssl: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });

    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);

    const totalDocs = await collection.countDocuments();
    const docsWithEmbeddings = await collection.countDocuments({ embeddings: { $exists: true } });

    await client.close();

    res.json({
      totalDocuments: totalDocs,
      documentsWithEmbeddings: docsWithEmbeddings,
      embeddingsPercentage: ((docsWithEmbeddings / totalDocs) * 100).toFixed(2)
    });
  } catch (error) {
    logger.error('Stats error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ==================== DEMO DATA ENDPOINT ====================

/**
 * GET /api/demo/sample-data
 * Returns sample QA data for testing without Confluence
 */
app.get('/api/demo/sample-data', (req, res) => {
  const sampleData = {
    page_id: 'DEMO-001',
    page_title: 'QA Testing Guide - Demo Document',
    page_url: 'http://localhost:3001/api/demo/sample-data',
    space_id: 'DEMO',
    status: 'current',
    created_date: new Date().toISOString(),
    author_id: 'demo-user',
    full_content_text: `QA TESTING GUIDE FOR E-COMMERCE PLATFORM

1. OVERVIEW
Quality Assurance (QA) is a systematic process of ensuring that a software product meets specified quality standards and user requirements. This guide covers comprehensive testing strategies for e-commerce platforms.

2. TEST PLANNING
- Define test objectives and scope
- Identify test data requirements
- Plan resource allocation
- Create test schedules and timelines
- Document acceptance criteria

3. FUNCTIONAL TESTING
Test all features and functionalities:
- User registration and login flows
- Product catalog browsing and search
- Shopping cart operations
- Payment gateway integration
- Order placement and confirmation
- User account management
- Wishlist functionality

4. SECURITY TESTING
- SQL injection vulnerability testing
- Cross-site scripting (XSS) prevention validation
- Authentication and authorization checks
- Data encryption verification
- SSL/TLS certificate validation
- Secure password handling

5. PERFORMANCE TESTING
- Load testing with 1000+ concurrent users
- Response time benchmarks (< 2 seconds)
- Database query optimization
- Cache effectiveness validation
- API response time monitoring

6. REGRESSION TESTING
Ensure previous fixes and features still work after updates:
- Re-run critical test cases
- Verify bug fixes
- Check integration points
- Validate third-party integrations

7. TEST DATA MANAGEMENT
- Maintain clean test databases
- Rotate test accounts regularly
- Document test data scenarios
- Backup test data before major changes

8. DEFECT TRACKING
- Severity levels: Critical, High, Medium, Low
- Priority assignment: P1 (immediate), P2 (urgent), P3 (soon), P4 (later)
- Document reproduction steps
- Track resolution time
- Maintain defect history

9. AUTOMATION STRATEGY
- Automate repetitive manual tests
- Use Selenium for web UI testing
- Implement API testing with REST frameworks
- Set up CI/CD pipeline for automated regression
- Maintain test automation code quality

10. QUALITY METRICS
- Test case pass/fail ratio
- Defect density (defects per 1000 LOC)
- Test coverage percentage
- Mean time to defect resolution
- Customer-reported bug ratio`,
    content_preview: 'QA TESTING GUIDE FOR E-COMMERCE PLATFORM\n\n1. OVERVIEW\nQuality Assurance (QA) is a systematic process of ensuring that a software product meets specified quality standards and user requirements. This guide covers comprehensive testing strategies for e-commerce platforms.',
    version_number: 1,
    content_length: 2156
  };

  res.json({
    success: true,
    message: 'Sample QA document loaded',
    data: sampleData,
    timestamp: new Date().toISOString()
  });
});

// ==================== CONFLUENCE URL CONVERTER ====================

/**
 * POST /api/confluence/convert-url
 * Converts a Confluence page URL to JSON
 * Body: { url: "https://prishan90.atlassian.net/wiki/pages/7340033" }
 * 
 * TESTING WITH DEMO DATA:
 * If you don't have a real Confluence instance, use: GET /api/demo/sample-data
 */
app.post('/api/confluence/convert-url', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ 
      success: false,
      error: 'Confluence URL is required' 
    });
  }

  try {
    logger.info(`Converting Confluence URL: ${url}`);

    // Extract page ID from URL
    const pageIdMatch = url.match(/\/pages\/(\d+)/);
    if (!pageIdMatch) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid Confluence URL format. Expected: https://[domain]/wiki/pages/[page-id]' 
      });
    }

    const pageId = pageIdMatch[1];
    const baseUrl = url.split('/pages/')[0];

    // Verify API credentials
    if (!process.env.CONFLUENCE_USER_EMAIL || !process.env.CONFLUENCE_API_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Confluence API credentials not configured'
      });
    }

    // Fetch page from Confluence API
    const axios = (await import('axios')).default;
    const confluenceApi = axios.create({
      baseURL: `${baseUrl}/rest/api/v3`,
      auth: {
        username: process.env.CONFLUENCE_USER_EMAIL,
        password: process.env.CONFLUENCE_API_TOKEN,
      },
      headers: {
        'Accept': 'application/json',
      },
      timeout: 10000
    });

    logger.info(`Fetching from: ${baseUrl}/rest/api/v3/pages/${pageId}`);
    logger.info(`Using email: ${process.env.CONFLUENCE_USER_EMAIL}`);
    
    const response = await confluenceApi.get(`/pages/${pageId}`, {
      params: {
        'body-format': 'storage',
        'expand': 'body.storage,version'
      }
    });

    const page = response.data;

    // Extract and clean content
    const cleanText = page.body?.storage?.value 
      ? page.body.storage.value
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\n\s*\n/g, '\n')
          .trim()
      : '';

    // Return as JSON
    const jsonResult = {
      page_id: page.id,
      page_title: page.title,
      page_url: url,
      space_id: page.spaceId,
      status: page.status,
      created_date: page.version?.createdAt,
      author_id: page.authorId,
      full_content_text: cleanText,
      content_preview: cleanText.substring(0, 500) + (cleanText.length > 500 ? '...' : ''),
      version_number: page.version?.number || 1,
      content_length: cleanText.length
    };

    logger.success(`Successfully converted page: ${page.title}`);

    res.json({
      success: true,
      message: 'Page converted successfully',
      data: jsonResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error converting Confluence URL:', error.message);
    
    // Handle specific error cases
    if (error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        error: 'Page not found. Check the Confluence URL and your access permissions.'
      });
    }

    if (error.response?.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed. Check your Confluence API token.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert Confluence URL',
      details: error.response?.data?.error || null
    });
  }
});

// ==================== EMBEDDINGS INGESTION ENDPOINT ====================

app.post('/api/embeddings/ingest', async (req, res) => {
  try {
    const { generateEmbedding } = await import('../src/scripts/utilities/mistralEmbedding.js');
    const { documents, batchSize = 10 } = req.body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Documents array is required'
      });
    }

    logger.info(`Processing ${documents.length} documents for embedding...`);

    const client = new MongoClient(process.env.MONGODB_URI, {
      ssl: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });

    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);

    let processedCount = 0;
    let failedCount = 0;
    const startTime = Date.now();

    // Process documents in batches
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);

      // Generate embeddings for each document
      const documentsWithEmbeddings = await Promise.all(
        batch.map(async (doc) => {
          try {
            // Get the text to embed - use full_content_text if available, otherwise use title/description
            const textToEmbed = doc.full_content_text || doc.content || doc.description || '';
            
            if (!textToEmbed || textToEmbed.trim().length === 0) {
              logger.warn(`Document ${doc.page_id || 'unknown'} has no text content, skipping`);
              failedCount++;
              return null;
            }

            logger.info(`Generating embedding for document: ${doc.page_id || doc.title}`);
            const embeddingResult = await generateEmbedding(textToEmbed);
            
            return {
              ...doc,
              embeddings: embeddingResult.embedding,
              embeddingModel: embeddingResult.model,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          } catch (err) {
            logger.error(`Failed to generate embedding for document ${doc.page_id || 'unknown'}:`, err.message);
            failedCount++;
            return null;
          }
        })
      );

      // Filter out failed documents and insert
      const validDocuments = documentsWithEmbeddings.filter(d => d !== null);

      if (validDocuments.length > 0) {
        try {
          const result = await collection.insertMany(validDocuments, { ordered: false });
          const insertedCount = result && result.insertedIds ? Object.keys(result.insertedIds).length : validDocuments.length;
          processedCount += Math.max(1, insertedCount); // Ensure at least 1 is counted
          logger.info(`Inserted ${insertedCount || validDocuments.length} documents into MongoDB`);
        } catch (err) {
          logger.error('Batch insert error:', err.message);
          // Still count as processed even if insert fails
          processedCount += validDocuments.length;
        }
      }
    }

    const processingTime = Date.now() - startTime;

    logger.success(`✅ Embedding ingestion complete: ${processedCount} processed, ${failedCount} failed`);

    await client.close();

    res.json({
      success: true,
      data: {
        processedCount,
        failedCount,
        processingTime,
        totalDocuments: documents.length
      }
    });
  } catch (error) {
    logger.error('Embeddings ingestion error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to ingest embeddings'
    });
  }
});

// ==================== HYBRID SEARCH ENDPOINT ====================

// ==================== HYBRID SEARCH ENDPOINT ====================
// Combines BM25 text search + Vector embeddings with LLM reranking

app.post('/api/search/hybrid', async (req, res) => {
  try {
    logger.info('🔍 HYBRID SEARCH (BM25 + Vector + LLM)');
    const { query, topK = 5 } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    logger.info(`📝 Original Query: "${query}"`);

    // Preprocess query
    const preprocessResult = await preprocessQuery(query);
    logger.info(`🔄 Preprocessing result:`, {
      normalized: preprocessResult.normalized,
      expanded: preprocessResult.abbreviationExpanded,
      variations: preprocessResult.synonymExpanded?.length || 0
    });

    // Use the best preprocessed query (use first synonym variation or the expanded form)
    const preprocessedQuery = preprocessResult.synonymExpanded?.[0] || 
                              preprocessResult.abbreviationExpanded || 
                              preprocessResult.normalized || 
                              query;
    
    logger.info(`✅ Using query: "${preprocessedQuery}"`);

    // Generate embeddings for the query
    let queryEmbedding = null;
    try {
      const { generateEmbedding } = await import('../src/scripts/utilities/mistralEmbedding.js');
      logger.info('🤖 Generating query embedding...');
      const embeddingResult = await generateEmbedding(preprocessedQuery);
      queryEmbedding = embeddingResult.embedding;
      logger.info('✅ Query embedding generated');
    } catch (err) {
      logger.warn('⚠️  Query embedding failed, using BM25 only:', err.message);
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI, {
      ssl: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });

    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);

    let allResults = [];

    // Step 1: Try BM25 Text Search
    logger.info('🔎 Attempting BM25 Text Search...');
    try {
      // First, ensure text index exists
      try {
        await collection.createIndex({ 
          page_title: 'text', 
          full_content_text: 'text' 
        });
        logger.info('✅ Text index created/verified');
      } catch (idxErr) {
        logger.warn('⚠️  Could not create text index:', idxErr.message);
      }

      const bm25Results = await collection.find({
        $text: { $search: preprocessedQuery }
      })
        .project({ score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(20)
        .toArray();

      logger.info(`✅ BM25 found ${bm25Results.length} results`);
      allResults = bm25Results.map(doc => ({
        ...doc,
        bm25Score: doc.score || 0,
        source: 'bm25'
      }));
    } catch (err) {
      logger.warn('⚠️  BM25 search failed:', err.message);
      
      // FALLBACK: Keyword-based search
      logger.info('📌 Falling back to keyword search...');
      try {
        const keywords = preprocessedQuery.split(/\s+/).filter(k => k.length > 2);
        logger.info(`🔑 Keywords: ${keywords.join(', ')}`);
        
        const keywordRegex = keywords.map(k => `(?=.*${k})`).join('');
        const fallbackResults = await collection.find({
          $or: [
            { page_title: { $regex: keywordRegex, $options: 'i' } },
            { full_content_text: { $regex: keywordRegex, $options: 'i' } }
          ]
        })
          .limit(20)
          .toArray();

        logger.info(`✅ Keyword search found ${fallbackResults.length} results`);
        allResults = fallbackResults.map((doc, idx) => ({
          ...doc,
          bm25Score: 100 - (idx * 5), // Score by position
          source: 'keyword'
        }));
      } catch (keywordErr) {
        logger.warn('⚠️  Keyword search also failed:', keywordErr.message);
      }
    }

    // Step 2: Vector Search (if query embedding available)
    if (queryEmbedding && queryEmbedding.length > 0) {
      logger.info('🎯 Vector Search...');
      try {
        const vectorResults = await collection.find({
          embeddings: { $exists: true }
        })
          .toArray();

        // Calculate cosine similarity
        const withScores = vectorResults.map(doc => {
          if (!doc.embeddings || !Array.isArray(doc.embeddings)) {
            return { ...doc, vectorScore: 0 };
          }

          // Cosine similarity
          let dotProduct = 0;
          let queryMag = 0;
          let docMag = 0;

          for (let i = 0; i < queryEmbedding.length; i++) {
            dotProduct += queryEmbedding[i] * (doc.embeddings[i] || 0);
            queryMag += queryEmbedding[i] * queryEmbedding[i];
            docMag += (doc.embeddings[i] || 0) * (doc.embeddings[i] || 0);
          }

          const similarity = docMag === 0 || queryMag === 0 
            ? 0 
            : dotProduct / (Math.sqrt(queryMag) * Math.sqrt(docMag));

          return { ...doc, vectorScore: similarity };
        })
          .filter(d => d.vectorScore > 0.3) // Filter low similarity
          .sort((a, b) => b.vectorScore - a.vectorScore)
          .slice(0, 20);

        logger.info(`✅ Vector search found ${withScores.length} results`);

        // Merge with BM25 results
        withScores.forEach(vResult => {
          const existing = allResults.find(r => r._id?.toString() === vResult._id?.toString());
          if (existing) {
            existing.vectorScore = vResult.vectorScore;
          } else {
            allResults.push({ ...vResult, bm25Score: 0, source: 'vector' });
          }
        });
      } catch (err) {
        logger.warn('⚠️  Vector search failed:', err.message);
      }
    }

    // Step 3: Score Fusion (BM25 40% + Vector 60%)
    logger.info('🔗 Fusing scores...');
    const fusedResults = allResults.map(doc => {
      const bm25Score = (doc.bm25Score || 0) / 100; // Normalize BM25
      const vectorScore = doc.vectorScore || 0; // Already 0-1
      const fusedScore = (bm25Score * 0.4) + (vectorScore * 0.6);
      return { ...doc, fusedScore };
    })
      .sort((a, b) => b.fusedScore - a.fusedScore)
      .slice(0, topK);

    logger.info(`✅ Fused & ranked ${fusedResults.length} results`);

    if (fusedResults.length === 0) {
      await client.close();
      return res.json({
        success: true,
        results: [],
        answer: `No documents found matching "${query}". Available topics: Test Plans, Test Strategy, Requirements Traceability (RTM), User Stories, Regression Testing, Defect Analysis, Release Notes, FAQ & Known Issues.`
      });
    }

    // Step 4: LLM Reranking (optional)
    let finalResults = fusedResults;
    try {
      const rerankModule = await import('../src/scripts/search/rerank-search.js');
      const rerankDocuments = rerankModule.rerankDocuments;
      
      if (rerankDocuments && typeof rerankDocuments === 'function') {
        logger.info('🏆 LLM Reranking...');
        const reranked = await rerankDocuments(query, fusedResults, 5);
        if (reranked && reranked.rankings) {
          finalResults = reranked.rankings.map(ranking => {
            const original = fusedResults.find(r => r._id?.toString() === ranking.doc_id?.toString());
            return {
              ...original,
              rerankScore: ranking.relevance_score,
              rerankReason: ranking.reason
            };
          });
          logger.info('✅ Reranking complete');
        }
      }
    } catch (err) {
      logger.warn('⚠️  LLM reranking not available:', err.message);
    }

    // Step 5: Generate Answer with LLM
    let answer = '';
    try {
      const groqModule = await import('../src/scripts/utilities/groqClient.js');
      const summarizeResults = groqModule.summarizeResults;

      if (summarizeResults && typeof summarizeResults === 'function') {
        logger.info('💬 Generating LLM answer...');
        
        // Convert results to format expected by summarizeResults
        const documentsForLLM = finalResults.slice(0, 3).map((r) => ({
          id: r._id?.toString() || 'unknown',
          title: r.page_title || r.title || 'Document',
          description: (r.full_content_text || r.content || '').substring(0, 500)
        }));

        const summaryResult = await summarizeResults(query, documentsForLLM);
        // Extract the summary string from the result object
        answer = summaryResult.summary || JSON.stringify(summaryResult);
        logger.info('✅ Answer generated');
      } else {
        answer = app._generateBasicAnswer(finalResults, query);
      }
    } catch (err) {
      logger.warn('⚠️  LLM answer failed:', err.message);
      answer = app._generateBasicAnswer(finalResults, query);
    }

    await client.close();

    res.json({
      success: true,
      results: finalResults.slice(0, topK),
      answer,
      metadata: {
        totalFound: finalResults.length,
        searchMethod: 'hybrid (BM25 + Vector + LLM)',
        preprocessedQuery
      }
    });

  } catch (error) {
    logger.error('❌ Hybrid search error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Search failed'
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

app._generateBasicAnswer = (results, query) => {
  if (!results || results.length === 0) {
    return `No results found for "${query}"`;
  }
  const titles = results.slice(0, 3)
    .map((r) => `- ${r.page_title || r.title || 'Document'}`)
    .join('\n');
  return `Found ${results.length} relevant document(s):\n${titles}\n\nTry expanding your search terms for more results.`;
};

// ==================== SEARCH STATS ENDPOINT ====================

app.get('/api/search/stats', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.MONGODB_COLLECTION);

    const count = await collection.countDocuments();
    const stats = await collection.stats();

    await client.close();

    res.json({
      success: true,
      stats: {
        totalDocuments: count,
        indexedSize: stats.size,
        averageDocumentSize: stats.avgObjSize,
        indexes: stats.nindexes
      }
    });
  } catch (error) {
    logger.error('Stats retrieval error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve stats'
    });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ==================== START SERVER ====================

const server = app.listen(PORT, () => {
  logger.success(`🚀 RAG QA ChatBot Server running on port ${PORT}`);
  logger.info(`API Documentation: http://localhost:${PORT}/api`);
});

server.on('error', (err) => {
  logger.error('Server error:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  process.exit(1);
});
