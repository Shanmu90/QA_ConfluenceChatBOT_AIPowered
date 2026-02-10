# QA ChatBot RAG

A production-ready **Retrieval-Augmented Generation (RAG)** system for intelligent QA documentation search and answer generation.

## ✨ Features

- **Multi-Strategy Retrieval**: BM25 (keyword) + Vector (semantic) + Hybrid search
- **LLM-Powered Reranking**: Uses Groq Llama for intelligent result ranking
- **Smart Query Processing**: Normalization, abbreviation expansion, synonym generation
- **Batch Embedding Generation**: Efficient processing with rate limiting
- **Production APIs**: RESTful endpoints for all RAG components
- **Modular Architecture**: Easy to extend and customize

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start server
npm run server

# 4. Test with API
curl -X POST http://localhost:3001/api/rag \
  -H "Content-Type: application/json" \
  -d '{"query":"What are negative test cases for payment?"}'
```

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup & configuration guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture & detailed design
- **[API Reference](#api-endpoints)** - All available endpoints below

## 🏗️ Architecture

```
User Query
    ↓
Query Preprocessing (Normalize → Expand Abbreviations → Synonyms)
    ↓
Hybrid Search (BM25 + Vector in parallel)
    ↓
LLM Reranking (Groq)
    ↓
Summarization & Answer Generation
    ↓
Response with Source Citations
```

## 📊 Technology Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (Vector Search)
- **Embeddings**: Mistral AI (1024-dim)
- **LLM**: Groq (Llama models)
- **Frontend**: React + Material-UI (optional)

## 🔌 API Endpoints

### Complete RAG Pipeline

```bash
POST /api/rag
Content-Type: application/json

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
    {"id": "TC-503", "title": "Payment Timeout - Network Failure"}
  ],
  "processingTime": 2500
}
```

### Individual Search Endpoints

**BM25 (Full-Text)**
```bash
POST /api/search/bm25
{"query": "payment timeout", "limit": 10}
```

**Vector (Semantic)**
```bash
POST /api/search/vector
{"query": "payment timeout", "limit": 10}
```

**Hybrid (BM25 + Vector)**
```bash
POST /api/search/hybrid
{"query": "payment timeout", "limit": 10, "weights": {"bm25": 0.6, "vector": 0.4}}
```

**Reranking (LLM-Enhanced)**
```bash
POST /api/search/rerank
{"query": "payment timeout", "limit": 5}
```

### Query Preprocessing

```bash
POST /api/preprocess
{
  "query": "TC-001 negative test cases UAT",
  "options": {"enableAbbreviations": true, "enableSynonyms": true}
}
```

## 📁 Project Structure

```
QA_ChatBot/
├── src/
│   ├── scripts/
│   │   ├── utilities/           # Core: Logging, Errors, Embeddings, LLM
│   │   ├── query-preprocessing/ # Query enhancement pipeline
│   │   ├── search/              # Search strategies (BM25, Vector, Hybrid, Rerank)
│   │   └── data-pipeline/       # Embeddings & data validation
│   ├── config/                  # MongoDB index configs
│   └── rag-pipeline.js          # Main orchestrator
├── server/
│   └── index.js                 # Express backend
├── client/                      # React frontend (optional)
├── .env.example                 # Configuration template
└── SETUP.md                     # Setup guide
```

## 🧪 Testing

```bash
# Test preprocessing
npm run preprocess-test

# Test search functions
npm run search-test

# Health check
curl http://localhost:3001/api/health
```

## ⚙️ Configuration

All configuration via `.env` file:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...
DB_NAME=qa_chatbot
COLLECTION_NAME=test_cases

# APIs
MISTRAL_API_KEY=...
GROQ_API_KEY=...

# Search
BM25_WEIGHT=0.6
VECTOR_WEIGHT=0.4

# Server
PORT=3001
```

## 🔐 Security

- API keys in `.env` (never committed)
- MongoDB IP whitelist
- Input validation on all endpoints
- CORS configured for production

## 📈 Performance

| Operation | Time |
|-----------|------|
| Query Preprocessing | 40-60ms |
| BM25 Search | 100-200ms |
| Vector Search | 150-300ms |
| Hybrid Search | 200-400ms |
| LLM Reranking | 800-1500ms |
| Summarization | 1200-2000ms |
| **Complete Pipeline** | **2.5-4.5 seconds** |

## 🤝 Contributing

1. Create feature branch
2. Implement changes
3. Run tests (`npm run preprocess-test`)
4. Update documentation
5. Submit PR

## 📚 Learn More

- [SETUP.md](./SETUP.md) - Step-by-step setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed system design
- [MongoDB Vector Search](https://www.mongodb.com/docs/atlas/atlas-vector-search/)
- [Mistral AI](https://docs.mistral.ai/)
- [Groq](https://console.groq.com/)

## 📞 Support

For issues and questions, check [SETUP.md](./SETUP.md) troubleshooting section or create an issue.

---

**Version:** 1.0.0  
**Status:** Production Ready  
**License:** MIT  
**Last Updated:** January 2026
# QA_ConfluenceChatBOT_AIPowered
