# QA ChatBot RAG - Quick Reference

## 🚀 5-Minute Startup

```bash
# 1. Setup
cd QA_ChatBot
cp .env.example .env
# Edit .env with your API keys

# 2. Install
npm install

# 3. Create MongoDB Indexes
# (Go to MongoDB Atlas → Add Index → Use configs from src/config/)

# 4. Run
npm run server

# 5. Test
curl http://localhost:3001/api/health
```

---

## 📡 API Quick Calls

### Full RAG Pipeline (Best)
```bash
curl -X POST http://localhost:3001/api/rag \
  -H "Content-Type: application/json" \
  -d '{"query":"What are negative test cases?"}'
```

### Quick Search
```bash
curl -X POST http://localhost:3001/api/search/hybrid \
  -H "Content-Type: application/json" \
  -d '{"query":"payment timeout"}'
```

### Preprocessing
```bash
curl -X POST http://localhost:3001/api/preprocess \
  -H "Content-Type: application/json" \
  -d '{"query":"TC-001 negative UAT test"}'
```

### Create Embeddings
```bash
curl -X POST http://localhost:3001/api/embeddings/create \
  -H "Content-Type: application/json" \
  -d '{"documents":[...]}'
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `server/index.js` | API endpoints |
| `src/rag-pipeline.js` | Main orchestrator |
| `src/scripts/query-preprocessing/queryPreprocessor.js` | Query enhancement |
| `src/scripts/search/hybrid-search.js` | Search strategy |
| `src/scripts/utilities/groqClient.js` | LLM integration |
| `src/scripts/utilities/mistralEmbedding.js` | Embeddings |

---

## ⚙️ Configuration

```env
# Essential
MONGODB_URI=mongodb+srv://...
MISTRAL_API_KEY=your_key
GROQ_API_KEY=your_key

# Optional
PORT=3001
BM25_WEIGHT=0.6
VECTOR_WEIGHT=0.4
```

---

## 📊 Data Format

```javascript
{
  id: "TC-001",
  title: "Login Test",
  description: "Test login flow",
  module: "Auth",
  steps: ["Step 1", "Step 2"],
  expectedResults: ["Logged in"],
  labels: ["Smoke"]
}
```

---

## 🧪 Testing

```bash
# Preprocessing
npm run preprocess-test

# Search
npm run search-test

# Full pipeline
npm run dev  # Start both server & client
```

---

## 📈 Performance

| Operation | Time |
|-----------|------|
| Preprocessing | 40-60ms |
| BM25 Search | 100-200ms |
| Vector Search | 150-300ms |
| Hybrid | 200-400ms |
| Reranking | 800-1500ms |
| Full Pipeline | 2.5-4.5s |

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Check port
lsof -i :3001

# Check .env
cat .env | grep -E "MONGODB|MISTRAL|GROQ"
```

### No search results
```bash
# Check embeddings
curl http://localhost:3001/api/embeddings/validate

# Check data
curl http://localhost:3001/api/stats
```

### Slow performance
- Reduce `searchLimit`
- Skip reranking: `enableReranking: false`
- Use BM25 only for fast queries

---

## 📚 Documentation

| File | Content |
|------|---------|
| `README.md` | Features & overview |
| `SETUP.md` | Installation guide |
| `ARCHITECTURE.md` | System design |
| `EXAMPLES.md` | Usage patterns |
| `IMPLEMENTATION_SUMMARY.md` | What was built |

---

## 🔗 Useful Commands

```bash
# Start server only
npm run server

# Start with frontend
npm run dev

# Test preprocessing
npm run preprocess-test

# Test search
npm run search-test

# Check health
curl http://localhost:3001/api/health

# Get stats
curl http://localhost:3001/api/stats
```

---

## 💡 Tips

1. **First load data** before testing search
2. **Generate embeddings** after loading data
3. **Test preprocessing** to see query variations
4. **Use hybrid search** for balanced results
5. **Enable reranking** for best quality
6. **Monitor logs** with `DEBUG=1`

---

## 🎯 Next Steps

1. **Day 1**: Setup & test
2. **Day 2**: Load your data
3. **Day 3**: Generate embeddings
4. **Day 4**: Customize dictionaries
5. **Week 2**: Build frontend
6. **Week 3**: Deploy to production

---

**For detailed guides, see:**
- Setup: `SETUP.md`
- Examples: `EXAMPLES.md`  
- Architecture: `ARCHITECTURE.md`

