# Confluence Data Extraction Guide

## Overview

This guide explains how to fetch Confluence pages and extract them for use in your RAG (Retrieval-Augmented Generation) QA Chatbot pipeline.

---

## ✅ What's Been Created

### 1. **8 Sample Confluence Pages** (in your PM space)
   - ✨ Test Plans - Payment Module UAT
   - ✨ Test Strategy Documents
   - ✨ RTM - Requirement Traceability Matrix
   - ✨ User Stories - Payment Features
   - ✨ Regression Scope Documents
   - ✨ Defect RCA - Payment Timeout Issue
   - ✨ Release Notes - Payment Module v2.1.0
   - ✨ FAQ - Payment Module Known Issues

### 2. **Extraction Script**
   - Location: `src/scripts/data-conversion/fetch-confluence-pages.js`
   - Fetches pages from Confluence API
   - Extracts metadata and content
   - Saves to JSON format

### 3. **Sample Extracted Data**
   - Location: `src/data/confluence-pages-extracted.json`
   - 8 pages with full metadata and cleaned content
   - Ready for embedding generation

---

## 🔧 Setup Steps

### Step 1: Verify API Token Configuration

Your `.env` file should have:

```bash
CONFLUENCE_BASE_URL=https://prishan90.atlassian.net/wiki
CONFLUENCE_USER_EMAIL=your-email@company.com
CONFLUENCE_API_TOKEN=your_actual_api_token_here
```

### Step 2: Update Environment Variables (if needed)

If you don't have `.env` configured:

```bash
# In your terminal, set environment variables
$env:CONFLUENCE_BASE_URL = "https://prishan90.atlassian.net/wiki"
$env:CONFLUENCE_USER_EMAIL = "your-email@company.com"
$env:CONFLUENCE_API_TOKEN = "your_api_token"
```

---

## 📥 Running the Extraction Script

### Option 1: Using Node.js Directly

```bash
# Navigate to project root
cd c:\Users\Vikram\Desktop\GenAI\Week3_RetrivalPipeline_Nov_15_16\QA_ChatBot

# Install axios if not already installed
npm install axios

# Run the extraction script
node src/scripts/data-conversion/fetch-confluence-pages.js
```

### Option 2: Using npm script (add to package.json)

Add this to your `package.json`:

```json
{
  "scripts": {
    "fetch:confluence": "node src/scripts/data-conversion/fetch-confluence-pages.js"
  }
}
```

Then run:

```bash
npm run fetch:confluence
```

---

## 📊 Extracted Data Format

Each extracted page contains:

```json
{
  "page_id": "7340033",
  "page_title": "Test Plans - Payment Module UAT",
  "page_url": "https://prishan90.atlassian.net/wiki/pages/7340033",
  "space_id": "294916",
  "status": "current",
  "created_date": "2026-01-29T09:19:32.929Z",
  "last_modified_date": "2026-01-29T09:19:32.929Z",
  "author_id": "712020:44907a29-46ec-49dc-bbd8-c020e2ecc5db",
  "owner_id": "712020:44907a29-46ec-49dc-bbd8-c020e2ecc5db",
  "parent_id": "295017",
  "parent_type": "page",
  "labels": ["UAT", "Payments", "TestPlans"],
  "version_number": 1,
  "content_html": "...", // First 500 chars of HTML content
  "content_text": "...", // First 1000 chars of extracted text
  "full_content_text": "..." // Complete extracted text
}
```

---

## 🔄 Integration with RAG Pipeline

### Step 1: Extract from Confluence ✅
```
fetch-confluence-pages.js → confluence-pages-extracted.json
```

### Step 2: Generate Embeddings
```bash
node src/scripts/embeddings/create-embeddings-batch-mistral.js
```

Input: `src/data/confluence-pages-extracted.json`  
Output: MongoDB with embeddings stored

### Step 3: Search & Retrieve
```bash
# Vector search
node src/scripts/search/search-vector-db.js "your query"

# BM25 search
node src/scripts/search/bm25-search.js "your query"

# Hybrid search
node src/scripts/search/score-fusion-search.js "your query"
```

### Step 4: Rerank & Summarize
```bash
node src/scripts/search/rerank-search.js "your query"
```

---

## 📋 Field Mapping

| Confluence Field | JSON Field | Use Case |
|---|---|---|
| Page Title | `page_title` | Document name, BM25 index |
| Page Content (Storage) | `full_content_text` | Embedding generation, search |
| Page URL | `page_url` | Source citation link |
| Page Labels | `labels` | Filtering, categorization |
| Created Date | `created_date` | Freshness ranking |
| Version Number | `version_number` | Change tracking |
| Space ID | `space_id` | Multi-space queries |

---

## 🎯 Customization

### Add More Space Keys

Modify line in `fetch-confluence-pages.js`:

```javascript
// Line ~150
const spaceKeys = ['PM', 'QA', 'TEST', 'BANKING_UAT']; // Add your spaces
```

### Filter by Labels

Add filtering logic:

```javascript
const extractedPages = pages
  .filter(page => page.labels?.includes('UAT')) // Filter by label
  .map(page => extractPageMetadata(page));
```

### Custom Field Weighting

Update the extraction function:

```javascript
return {
  ...existingFields,
  // Add custom weights for BM25
  title_weight: 10.0,
  description_weight: 5.0,
  content_weight: 1.0
};
```

---

## 🔐 Security Best Practices

### ✅ Do's
- ✅ Store API tokens in `.env` (never in code)
- ✅ Use IP whitelisting in Confluence
- ✅ Rotate API tokens regularly
- ✅ Encrypt sensitive data in MongoDB

### ❌ Don'ts
- ❌ Commit `.env` to Git
- ❌ Share API tokens
- ❌ Extract customer PII/credentials
- ❌ Store plaintext passwords

---

## 📱 API Rate Limiting

Confluence API limits: **8 requests/second**

The script includes built-in retry logic:
```javascript
// Automatic exponential backoff
max retries = 3
initial delay = 1000ms
backoff multiplier = 2
```

---

## 🐛 Troubleshooting

### Issue: 401 Unauthorized

**Solution:** Check API token is valid
```bash
# Re-generate token from:
# https://id.atlassian.com/manage-profile/security/api-tokens
```

### Issue: Space not found

**Solution:** Verify space key
```bash
# Check available spaces in script output
# Or visit: https://prishan90.atlassian.net/wiki/spaces
```

### Issue: Connection timeout

**Solution:** Check network and rate limits
```bash
# Add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
await delay(500); // 500ms between requests
```

---

## 📊 Sample Query After Extraction

```bash
# Once data is in MongoDB with embeddings:

POST http://localhost:3001/api/search/hybrid
{
  "query": "What are the negative test scenarios for payment timeout?",
  "limit": 10,
  "weights": {
    "bm25": 0.6,
    "vector": 0.4
  }
}
```

**Response** (with sources):
```json
{
  "results": [
    {
      "page_id": "7143425",
      "page_title": "Defect RCA - Payment Timeout Issue",
      "relevance_score": 0.94,
      "source_url": "https://prishan90.atlassian.net/wiki/pages/7143425",
      "matching_content": "Users experience payment timeout errors..."
    }
  ]
}
```

---

## 🚀 Next Steps

1. **Verify API token** is configured in `.env`
2. **Run extraction script** to fetch all pages
3. **Generate embeddings** for vector search
4. **Test queries** using search endpoints
5. **Deploy to production** with CI/CD

---

## 📞 Support

For issues with Confluence API:
- 📖 [Confluence REST API Docs](https://developer.atlassian.com/cloud/confluence/rest/v3/)
- 🔑 [API Token Management](https://id.atlassian.com/manage-profile/security/api-tokens)
- 🆘 [Atlassian Community](https://community.atlassian.com/)

---

**Last Updated:** 2026-01-29  
**Version:** 1.0.0
