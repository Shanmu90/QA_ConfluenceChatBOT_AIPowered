# API Reference - QA ChatBot Backend

All endpoints are hosted at `http://localhost:3001` (or your configured PORT).

---

## 1. Confluence URL Conversion

**Convert a Confluence page URL to structured JSON**

```
POST /api/confluence/convert-url
```

### Request
```json
{
  "confluenceUrl": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340033/Test+Plans"
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "page_id": "7340033",
    "page_title": "Test Plans",
    "full_content_text": "Payment Module Test Plans...",
    "module": "test-planning",
    "labels": ["qa", "testing", "payment"],
    "source_url": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340033/Test+Plans",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Response (Error)
```json
{
  "success": false,
  "error": "Failed to fetch Confluence page",
  "details": "404 Not Found"
}
```

### Status Codes
- `200` - Success
- `400` - Invalid URL provided
- `401` - Confluence authentication failed
- `404` - Confluence page not found
- `500` - Server error

### Environment Requirements
```env
CONFLUENCE_EMAIL=your-email@example.com
CONFLUENCE_API_TOKEN=your-api-token
```

### Example curl
```bash
curl -X POST http://localhost:3001/api/confluence/convert-url \
  -H "Content-Type: application/json" \
  -d '{
    "confluenceUrl": "https://prishan90.atlassian.net/wiki/spaces/PM/pages/7340033/Test+Plans"
  }'
```

---

## 2. Embeddings Ingestion

**Generate embeddings for documents and store in MongoDB**

```
POST /api/embeddings/ingest
```

### Request
```json
{
  "documents": [
    {
      "page_id": "7340033",
      "page_title": "Test Plans",
      "full_content_text": "Payment Module Test Plans...",
      "module": "test-planning",
      "labels": ["qa", "testing"],
      "source_url": "https://..."
    },
    {
      "page_id": "7340034",
      "page_title": "Test Strategy",
      "full_content_text": "Payment Processing Test Strategy...",
      "module": "test-strategy",
      "labels": ["qa", "strategy"],
      "source_url": "https://..."
    }
  ],
  "batchSize": 10
}
```

### Response (Success)
```json
{
  "success": true,
  "data": {
    "processedCount": 2,
    "failedCount": 0,
    "processingTime": 15000,
    "totalDocuments": 2
  }
}
```

### Response (Partial Failure)
```json
{
  "success": true,
  "data": {
    "processedCount": 1,
    "failedCount": 1,
    "processingTime": 8000,
    "totalDocuments": 2
  }
}
```

### Status Codes
- `200` - Success (some or all documents processed)
- `400` - Invalid request (missing documents array)
- `500` - Server error

### Processing Steps
1. Parse and validate JSON
2. Generate embeddings via Mistral API (1024 dimensions)
3. Insert documents with embeddings into MongoDB
4. Create/update BM25 index (keyword search)
5. Create/update Vector index (semantic search)
6. Return statistics

### Processing Time
- ~1-2 seconds per document
- 10 documents ≈ 15-20 seconds
- Batch size adjustable (default: 10)

### Environment Requirements
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=qa_chatbot
MONGODB_COLLECTION=documents
MISTRAL_API_KEY=your-mistral-key
```

### Example curl
```bash
curl -X POST http://localhost:3001/api/embeddings/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "page_id": "7340033",
        "page_title": "Test Plans",
        "full_content_text": "...",
        "module": "test-planning",
        "labels": ["qa"],
        "source_url": "https://..."
      }
    ],
    "batchSize": 10
  }'
```

---

## 3. Hybrid Search with LLM Answer

**Search documents using hybrid approach and generate LLM answer**

```
POST /api/search/hybrid
```

### Request
```json
{
  "query": "What are the negative payment test cases?",
  "topK": 5
}
```

### Response (Success)
```json
{
  "success": true,
  "results": [
    {
      "page_id": "7340035",
      "page_title": "Test Cases",
      "full_content_text": "TC-502: Expired Card Rejection...",
      "module": "test-cases",
      "labels": ["qa", "test-cases"],
      "source_url": "https://...",
      "score": 0.92
    },
    {
      "page_id": "7340033",
      "page_title": "Test Plans",
      "full_content_text": "Payment Module Test Plans...",
      "module": "test-planning",
      "labels": ["qa", "testing"],
      "source_url": "https://...",
      "score": 0.88
    }
  ],
  "answer": "Based on the QA documentation, negative test cases for payment include:\n- Invalid payment amounts (negative, zero, extremely large)\n- Expired card information\n- Insufficient funds scenarios\n- Invalid CVV/CVC codes\n- Network timeout handling\n- Payment processing failures\n- Declined transaction responses",
  "metadata": {
    "originalQuery": "What are the negative payment test cases?",
    "preprocessedQuery": "negative payment test cases",
    "totalResultsFound": 5,
    "topK": 5,
    "executionTime": 4200
  }
}
```

### Response (No Results)
```json
{
  "success": true,
  "results": [],
  "answer": "No matching documents found. Please try a different query.",
  "metadata": {
    "originalQuery": "...",
    "preprocessedQuery": "...",
    "totalResultsFound": 0,
    "topK": 5
  }
}
```

### Status Codes
- `200` - Success (may have 0 results)
- `400` - Invalid query (empty string)
- `500` - Server error

### Search Pipeline
1. **Query Preprocessing**
   - Normalize text (lowercase, punctuation removal)
   - Expand abbreviations and synonyms
   - Remove stop words
   - Expected time: 100-200ms

2. **Hybrid Search Execution**
   - BM25 keyword search (40% weight)
   - Vector semantic search (60% weight)
   - Combined scoring and ranking
   - Expected time: 1000-1500ms

3. **LLM Reranking**
   - Rerank top 5 results by relevance
   - Groq API for fast inference
   - Expected time: 500-1500ms

4. **Answer Generation**
   - LLM synthesizes answer from top 3 sources
   - Citation of document sources
   - Expected time: 1000-3000ms

5. **Response Assembly**
   - Format results with scores
   - Attach metadata
   - Return to client

### Total Expected Time
- Simple queries: 3-5 seconds
- Complex queries: 5-7 seconds
- Max: 10 seconds (timeout)

### Query Examples
```
"What are the negative payment test cases?"
"How do we handle payment failures?"
"What are the security requirements?"
"Tell me about the test plans"
"What was changed in the latest release?"
```

### Environment Requirements
```env
MONGODB_URI=mongodb+srv://...
GROQ_API_KEY=your-groq-key
MISTRAL_API_KEY=your-mistral-key
```

### Example curl
```bash
curl -X POST http://localhost:3001/api/search/hybrid \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the test cases?",
    "topK": 5
  }'
```

---

## 4. Search Statistics

**Get database statistics and index information**

```
GET /api/search/stats
```

### Response
```json
{
  "success": true,
  "stats": {
    "totalDocuments": 8,
    "indexedSize": 2097152,
    "averageDocumentSize": 262144,
    "indexes": 3
  }
}
```

### Status Codes
- `200` - Success
- `500` - Server error

### Information Provided
- **totalDocuments**: Count of documents in collection
- **indexedSize**: Total size of indexed data (bytes)
- **averageDocumentSize**: Average document size (bytes)
- **indexes**: Number of active indexes (BM25, Vector, _id)

### Use Cases
- Verify documents are stored
- Monitor index health
- Track database growth
- Validate ingestion success

### Example curl
```bash
curl -X GET http://localhost:3001/api/search/stats
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Failed to fetch Confluence page` | Invalid URL or auth | Verify URL and API token |
| `Authentication failed` | Wrong credentials | Regenerate API token |
| `Cannot connect to MongoDB` | Connection issue | Check MONGODB_URI and IP whitelist |
| `Invalid JSON` | Malformed request | Validate JSON syntax |
| `Documents array is required` | Missing documents | Include documents array in request |
| `Query is required` | Empty query string | Provide a search query |
| `Internal server error` | Unexpected error | Check server logs |

---

## Request/Response Examples

### Complete Flow Example

**1. Convert URL to JSON**
```bash
# Step 1: Get JSON from Confluence
curl -X POST http://localhost:3001/api/confluence/convert-url \
  -H "Content-Type: application/json" \
  -d '{"confluenceUrl": "https://..."}'

# Response: { "success": true, "data": {...} }
```

**2. Ingest Embeddings**
```bash
# Step 2: Store in MongoDB with embeddings
curl -X POST http://localhost:3001/api/embeddings/ingest \
  -H "Content-Type: application/json" \
  -d '{"documents": [...], "batchSize": 10}'

# Response: { "success": true, "data": {"processedCount": 1, ...} }
```

**3. Search with Hybrid**
```bash
# Step 3: Query and get answer
curl -X POST http://localhost:3001/api/search/hybrid \
  -H "Content-Type: application/json" \
  -d '{"query": "What are test cases?", "topK": 5}'

# Response: { "success": true, "results": [...], "answer": "..." }
```

**4. Check Stats**
```bash
# Verify ingestion
curl -X GET http://localhost:3001/api/search/stats

# Response: { "success": true, "stats": {...} }
```

---

## Performance Tuning

### Adjust Hybrid Search Weights
In `src/scripts/search/hybrid-search.js`:
```javascript
const { bm25Weight = 0.4, vectorWeight = 0.6 } = options;
// Increase bm25Weight for keyword-focused queries
// Increase vectorWeight for semantic-focused queries
```

### Adjust Batch Size
When ingesting documents:
```json
{
  "documents": [...],
  "batchSize": 20  // Default: 10, increase for faster ingestion
}
```

### Adjust Top-K Results
When searching:
```json
{
  "query": "...",
  "topK": 10  // Default: 5, increase for more results
}
```

---

## Integration Examples

### Python
```python
import requests
import json

# Search documents
response = requests.post(
    'http://localhost:3001/api/search/hybrid',
    json={
        'query': 'What are the test cases?',
        'topK': 5
    }
)
data = response.json()
print(data['answer'])
```

### JavaScript/Node.js
```javascript
const axios = require('axios');

const response = await axios.post(
  'http://localhost:3001/api/search/hybrid',
  {
    query: 'What are the test cases?',
    topK: 5
  }
);
console.log(response.data.answer);
```

### curl
```bash
curl -X POST http://localhost:3001/api/search/hybrid \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the test cases?", "topK": 5}' \
  | jq '.answer'
```

---

## Rate Limiting & Best Practices

- **No rate limits** (for now - add if needed in production)
- **Batch requests** when possible (reduces API calls)
- **Cache results** for repeated queries
- **Monitor performance** using `/api/search/stats`
- **Use appropriate topK** (5-10 for most use cases)

---

## Deployment

### Local Development
```bash
PORT=3001 npm run dev
```

### Production
```bash
NODE_ENV=production PORT=3001 npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]
```

---

**For more information, see RAG_IMPLEMENTATION_COMPLETE.md**
