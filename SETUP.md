# QA ChatBot RAG - Complete Setup Guide

## 📋 Prerequisites

- Node.js >= 14.x
- npm >= 6.x
- MongoDB Atlas cluster (with Vector Search enabled)
- API Keys:
  - Mistral AI (for embeddings)
  - Groq (for LLM operations)
  - Confluence API token (for data ingestion)

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
cd QA_ChatBot
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your API keys and MongoDB connection string:

```env
# MongoDB
MONGODB_URI="mongodb+srv://username:password@cluster-name.mongodb.net/?appName=qa-chatbot"
DB_NAME="qa_chatbot"
COLLECTION_NAME="test_cases"

# Mistral (Embeddings)
MISTRAL_API_KEY="your_mistral_key_here"

# Groq (LLM)
GROQ_API_KEY="your_groq_key_here"

# Server
PORT=3001
NODE_ENV=development
```

### 3. MongoDB Setup

#### Create Indexes in MongoDB Atlas

Go to your MongoDB Atlas cluster → Collections → Your Database → Your Collection → Search Indexes

**Vector Index:**
```json
{
  "fields": [
    {
      "path": "embeddings",
      "type": "vector",
      "numDimensions": 1024,
      "similarity": "cosine"
    }
  ]
}
```

**BM25 Full-Text Index:**
```json
{
  "fields": [
    {
      "path": "id",
      "type": "string"
    },
    {
      "path": "title",
      "type": "string"
    },
    {
      "path": "description",
      "type": "string"
    },
    {
      "path": "module",
      "type": "string"
    },
    {
      "path": "steps",
      "type": "stringFacet"
    }
  ]
}
```

### 4. Start the Server

```bash
# Development mode (with nodemon)
npm run server

# Or with both frontend and backend
npm run dev
```

Server runs on `http://localhost:3001`

### 5. Prepare Your Data

Create a JSON file with your test cases:

```json
[
  {
    "id": "TC-001",
    "title": "Login Flow Test",
    "description": "Validate user authentication process",
    "module": "Authentication",
    "steps": ["Step 1", "Step 2"],
    "expectedResults": ["User logged in"],
    "preRequisites": ["Browser open"],
    "labels": ["Smoke", "Regression"]
  }
]
```

### 6. Generate Embeddings

```bash
# Via API
curl -X POST http://localhost:3001/api/embeddings/create \
  -H "Content-Type: application/json" \
  -d '{"documents": [...your documents...]}'

# Or via npm script (after creating script)
npm run embeddings
```

### 7. Test the System

```bash
# Test query preprocessing
npm run preprocess-test

# Test search functionality
npm run search-test

# Test full RAG pipeline via API
curl -X POST http://localhost:3001/api/rag \
  -H "Content-Type: application/json" \
  -d '{"query": "What are negative test cases for payment?"}'
```

## 📚 API Endpoints

### Query Preprocessing

```
POST /api/preprocess
{
  "query": "TC-001 negative test cases",
  "options": {
    "enableAbbreviations": true,
    "enableSynonyms": true,
    "maxSynonymVariations": 5
  }
}
```

**Response:**
```json
{
  "original": "TC-001 negative test cases",
  "normalized": "tc-001 negative test cases",
  "abbreviationExpanded": "test case-001 negative test cases",
  "synonymExpanded": [
    "test case-001 invalid test cases",
    "test case-001 error test cases"
  ],
  "extractedTestCaseIds": ["TC-001"],
  "metadata": {...}
}
```

### Search Endpoints

#### BM25 (Full-Text)
```
POST /api/search/bm25
{
  "query": "payment timeout",
  "limit": 10
}
```

#### Vector (Semantic)
```
POST /api/search/vector
{
  "query": "payment timeout",
  "limit": 10
}
```

#### Hybrid (BM25 + Vector)
```
POST /api/search/hybrid
{
  "query": "payment timeout",
  "limit": 10,
  "weights": {"bm25": 0.6, "vector": 0.4}
}
```

#### Reranking (Hybrid + LLM)
```
POST /api/search/rerank
{
  "query": "payment timeout",
  "limit": 5,
  "initialLimit": 15
}
```

### RAG Pipeline

Complete end-to-end pipeline:

```
POST /api/rag
{
  "query": "What are negative test cases for payment timeout?",
  "options": {
    "enablePreprocessing": true,
    "enableReranking": true,
    "enableSummarization": true,
    "searchLimit": 5
  }
}
```

**Response:**
```json
{
  "userQuery": "What are negative test cases for payment timeout?",
  "answer": "The negative test cases include...",
  "sources": [
    {"id": "TC-503", "title": "Payment Timeout - Network Failure", "score": 0.94}
  ],
  "stages": {
    "preprocessing": {...},
    "search": {...},
    "summarization": {...}
  },
  "processingTime": 2500
}
```

## 🏗️ Project Structure

```
QA_ChatBot/
├── src/
│   ├── scripts/
│   │   ├── utilities/              # Core utilities
│   │   │   ├── logger.js
│   │   │   ├── errorHandler.js
│   │   │   ├── mistralEmbedding.js
│   │   │   └── groqClient.js
│   │   ├── query-preprocessing/    # Query enhancement
│   │   │   ├── dictionaries.js
│   │   │   ├── normalizer.js
│   │   │   ├── abbreviationMapper.js
│   │   │   ├── synonymExpander.js
│   │   │   ├── queryPreprocessor.js
│   │   │   └── test-preprocessing.js
│   │   ├── search/                 # Search strategies
│   │   │   ├── bm25-search.js
│   │   │   ├── vector-search.js
│   │   │   ├── hybrid-search.js
│   │   │   ├── rerank-search.js
│   │   │   └── test-search.js
│   │   └── data-pipeline/          # Data management
│   │       ├── create-embeddings.js
│   │       └── data-validation.js
│   ├── config/                     # MongoDB index configs
│   │   ├── vector-index.json
│   │   └── bm25-index.json
│   ├── data/                       # Data files
│   └── rag-pipeline.js             # Main orchestrator
├── server/
│   └── index.js                    # Express server
├── client/                         # React frontend (optional)
├── uploads/                        # File upload directory
├── package.json
├── .env.example
└── ARCHITECTURE.md
```

## 🧪 Testing

### 1. Test Query Preprocessing

```bash
npm run preprocess-test
```

Tests normalization, abbreviation expansion, and synonym generation.

### 2. Test Search Functions

```bash
npm run search-test
```

Tests BM25, Vector, Hybrid, and Reranking searches (requires documents with embeddings).

### 3. Manual API Testing

```bash
# Health check
curl http://localhost:3001/api/health

# Preprocess query
curl -X POST http://localhost:3001/api/preprocess \
  -H "Content-Type: application/json" \
  -d '{"query":"negative test cases for payment"}'

# Full RAG pipeline
curl -X POST http://localhost:3001/api/rag \
  -H "Content-Type: application/json" \
  -d '{"query":"What test cases exist for payment?"}'
```

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment |
| `MONGODB_URI` | - | MongoDB connection |
| `DB_NAME` | qa_chatbot | Database name |
| `COLLECTION_NAME` | test_cases | Collection name |
| `MISTRAL_API_KEY` | - | Mistral AI API key |
| `GROQ_API_KEY` | - | Groq API key |
| `BM25_WEIGHT` | 0.6 | BM25 weight in hybrid search |
| `VECTOR_WEIGHT` | 0.4 | Vector weight in hybrid search |
| `BATCH_SIZE` | 100 | Embedding batch size |

### Search Weights

Adjust the balance between keyword (BM25) and semantic (Vector) search:

```env
BM25_WEIGHT=0.7    # More keyword-focused
VECTOR_WEIGHT=0.3
```

or

```env
BM25_WEIGHT=0.4    # More semantic-focused
VECTOR_WEIGHT=0.6
```

## 📊 Data Format

### Document Structure

All documents must have this structure:

```javascript
{
  id: "TC-001",                              // Required: Unique ID
  title: "Login Test Case",                  // Required: Test case name
  description: "Test user login flow",       // Recommended: Description
  module: "Authentication",                  // Recommended: Module/Component
  steps: ["Step 1", "Step 2"],              // Array of test steps
  expectedResults: ["User logged in"],       // Array of expected outcomes
  preRequisites: ["Browser open"],          // Array of prerequisites
  labels: ["Smoke", "Regression"],          // Array of labels/tags
  source_url: "https://...",                // Source documentation URL
  embeddings: [0.123, -0.456, ...]          // Auto-generated (1024 dimensions)
}
```

## 🔐 Security

1. **Never commit `.env`** - Keep API keys confidential
2. **MongoDB IP Whitelist** - Configure in Atlas security
3. **CORS** - Currently allows all origins (configure for production)
4. **Input Validation** - All user inputs are validated
5. **Rate Limiting** - Implement in production

## 🚀 Deployment Checklist

- [ ] All API keys configured in `.env`
- [ ] MongoDB Vector index created
- [ ] MongoDB BM25 index created
- [ ] Test data loaded into collection
- [ ] Embeddings generated for all documents
- [ ] Server tested locally
- [ ] CORS configured for frontend URL
- [ ] Error logging configured
- [ ] API documentation shared with team

## 📖 API Documentation

Access interactive API docs (if Swagger configured):

```
http://localhost:3001/api/docs
```

## 🤝 Support & Troubleshooting

### No embeddings generated

- Check Mistral API key
- Verify rate limits (100 req/min)
- Check document structure

### Search returns no results

- Verify embeddings exist: `GET /api/embeddings/validate`
- Check MongoDB indexes created
- Verify COLLECTION_NAME matches

### Server won't start

- Check port 3001 is available
- Verify `.env` file configured
- Check Node.js version (>= 14)

## 📚 Additional Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design & flow
- [MongoDB Atlas Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Mistral AI Docs](https://docs.mistral.ai/)
- [Groq API Docs](https://console.groq.com/docs/)

---

**Version:** 1.0.0  
**Last Updated:** January 2026
