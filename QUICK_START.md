# Quick Start Guide - QA ChatBot RAG Pipeline

## 5-Minute Setup

### 1. Environment Configuration
Create/update `.env` file in project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=qa_chatbot
MONGODB_COLLECTION=documents

# Confluence
CONFLUENCE_EMAIL=your-email@example.com
CONFLUENCE_API_TOKEN=your-api-token-from-atlassian

# APIs
MISTRAL_API_KEY=your-mistral-api-key
GROQ_API_KEY=your-groq-api-key

# Server
PORT=3001
NODE_ENV=development
```

### 2. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Start Application

**Terminal 1 - Backend (Port 3001):**
```bash
npm run dev
```

**Terminal 2 - Frontend (Port 3000):**
```bash
cd client
npm start
```

### 4. Open in Browser
```
http://localhost:3000
```

---

## Using the 3-Step Pipeline

### Step 1: 📥 Ingest Data from Confluence

1. Open the UI and go to **"Step 1: Ingest Data"** tab
2. Paste your Confluence page URL:
   ```
   https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340033/Test+Plans
   ```
3. Click **"Convert to JSON"**
4. Copy the JSON output (or download)

**✅ Result:** JSON with page_id, title, content, labels, source_url

---

### Step 2: ⚙️ Generate Embeddings

1. Go to **"Step 2: Generate Embeddings"** tab
2. Paste the JSON from Step 1
3. Click **"Generate Embeddings & Ingest to MongoDB"**
4. Wait for success message

**✅ Result:** Documents stored in MongoDB with:
- 1024-dimensional embeddings (Mistral)
- BM25 indexes (keyword search)
- Vector indexes (semantic search)

---

### Step 3: 💬 QA ChatBot

1. Go to **"Step 3: QA ChatBot"** tab
2. Either:
   - **Click a sample question** (right sidebar)
   - **Type your own question** (search box)
3. View results with source documents
4. Click source chips to see full document content
5. Chat history is maintained in the conversation

**✅ Result:** Answers synthesized from indexed documents with source citations

---

## Sample Questions to Try

```
1. "What are the negative payment test cases?"
2. "How do we handle payment failures?"
3. "What are the security requirements?"
4. "What is the regression scope?"
5. "Tell me about the test plans"
6. "What should I do if a payment is stuck?"
7. "What was changed in the latest release?"
8. "What are the expected results for payment validation tests?"
```

See `QA_VALIDATION_GUIDE.md` for detailed expected answers.

---

## Architecture at a Glance

```
User Query
    ↓
Query Preprocessing (normalize, expand synonyms)
    ↓
Hybrid Search:
  • BM25 (keyword matching) [40% weight]
  • Vector (semantic similarity) [60% weight]
    ↓
Reranking with LLM (top 5 results)
    ↓
Answer Generation with LLM (synthesize sources)
    ↓
Display Results + Sources in UI
```

---

## Key Files to Know

| File | Purpose |
|------|---------|
| `client/src/App.js` | Main UI with 3 tabs |
| `client/src/components/data/ConvertToJson.js` | Step 1: Confluence → JSON |
| `client/src/components/data/EmbeddingsStore.js` | Step 2: JSON → Embeddings |
| `client/src/components/search/QAChatBot.js` | Step 3: Search & Chat |
| `server/index.js` | Express backend endpoints |
| `src/config/bm25-index.json` | BM25 search index config |
| `src/config/vector-index.json` | Vector search index config |

---

## Troubleshooting Quick Fixes

### "Port 3000 already in use"
```bash
# Find and kill process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "MongoDB connection error"
- Verify `MONGODB_URI` in .env
- Check IP whitelist in MongoDB Atlas
- Verify network connectivity

### "Confluence API error"
- Verify `CONFLUENCE_EMAIL` and `CONFLUENCE_API_TOKEN`
- Test token: regenerate in Atlassian account settings
- Verify page URL is correct and accessible

### "No results from search"
1. Verify Step 2 completed successfully
2. Check MongoDB indexes are Active (MongoDB Atlas UI)
3. Try simpler query with different keywords
4. Check backend logs for errors

### "Slow search response"
- Reduce `topK` parameter (currently 5)
- Check MongoDB indexes exist
- Verify Groq/Mistral API responsiveness
- Check internet connection

---

## API Endpoints Quick Reference

### 1. Convert Confluence URL
```bash
POST /api/confluence/convert-url
Content-Type: application/json

{
  "confluenceUrl": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/..."
}
```

### 2. Ingest & Generate Embeddings
```bash
POST /api/embeddings/ingest
Content-Type: application/json

{
  "documents": [{ page_id, page_title, full_content_text, ... }],
  "batchSize": 10
}
```

### 3. Hybrid Search
```bash
POST /api/search/hybrid
Content-Type: application/json

{
  "query": "What are the test cases?",
  "topK": 5
}
```

### 4. Get Statistics
```bash
GET /api/search/stats
```

---

## Performance Expectations

| Operation | Time |
|-----------|------|
| URL → JSON | 2-5s |
| Generate embeddings (1 doc) | 1-2s |
| Ingest 10 docs | 15-20s |
| Search query | 3-7s |

---

## Database Queries (MongoDB)

### View all documents
```javascript
db.documents.find().pretty()
```

### Check document count
```javascript
db.documents.countDocuments()
```

### Find by title
```javascript
db.documents.findOne({ page_title: "Test Plans" })
```

### Vector search query
```javascript
db.documents.aggregate([
  {
    $search: {
      cosmosSearch: {
        vector: [/* 1024-d vector */],
        k: 5
      },
      returnStoredSource: true
    }
  }
])
```

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Install dependencies
3. ✅ Start backend and frontend
4. ✅ Test with sample Confluence pages
5. ✅ Try all 8 sample questions
6. ✅ Verify answers are relevant
7. 🚀 Deploy to production!

---

## Additional Resources

- **Full Implementation Guide:** [RAG_IMPLEMENTATION_COMPLETE.md](RAG_IMPLEMENTATION_COMPLETE.md)
- **Validation Guide with Answers:** [QA_VALIDATION_GUIDE.md](QA_VALIDATION_GUIDE.md)
- **Architecture Details:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Confluence Setup:** [CONFLUENCE_EXTRACTION_GUIDE.md](CONFLUENCE_EXTRACTION_GUIDE.md)
- **MongoDB Config:** [MONGODB_INDEX_CONFIGURATION.md](MONGODB_INDEX_CONFIGURATION.md)

---

## Need Help?

**Common Issues:**
1. Check `.env` file has all required variables
2. Verify MongoDB Atlas cluster is running
3. Test Confluence API token (regenerate if needed)
4. Check backend logs: `npm run dev`
5. Check browser console for frontend errors (F12)

**API Testing:**
- Use Postman or curl to test endpoints
- Example: `curl -X POST http://localhost:3001/api/search/stats`

**Database Testing:**
- Use MongoDB Compass or Atlas UI
- Verify indexes are Active
- Check document count > 0

---

**You're all set! Start with Step 1 in the UI and follow the pipeline.** 🎉
