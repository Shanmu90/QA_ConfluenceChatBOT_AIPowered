# MongoDB Index Configuration - Vector & BM25

This document contains the complete index configurations for MongoDB Atlas to support both vector search and BM25 (full-text search).

---

## 1️⃣ BM25 Full-Text Search Index

**File:** `src/config/bm25-index.json`

**Purpose:** Full-text keyword-based search with field-level weighting

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
    },
    {
      "path": "expectedResults",
      "type": "stringFacet"
    }
  ]
}
```

### Field Explanation

| Field | Type | Purpose | Searchable |
|-------|------|---------|-----------|
| `id` | string | Test case ID (e.g., TC-001) | ✅ Yes |
| `title` | string | Test case name | ✅ Yes |
| `description` | string | Summary text | ✅ Yes |
| `module` | string | Feature/module name | ✅ Yes |
| `steps` | stringFacet | Test execution steps | ✅ Yes (faceted) |
| `expectedResults` | stringFacet | Expected outcomes | ✅ Yes (faceted) |

### How to Create in MongoDB Atlas

```bash
# Using MongoDB Atlas Web UI:
# 1. Go to Database → Collections → Your Collection
# 2. Click "Search Indexes" tab
# 3. Click "Create Index"
# 4. Select "JSON Editor"
# 5. Copy the JSON below and paste
# 6. Name it: "bm25_search_index"
# 7. Click "Create Index"

# Using MongoDB Shell (mongosh):
db.your_collection.collection.createSearchIndex([
  {
    "name": "bm25_search_index",
    "type": "search",
    "definition": {
      "mappings": {
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
          },
          {
            "path": "expectedResults",
            "type": "stringFacet"
          }
        ]
      }
    }
  }
])
```

---

## 2️⃣ Vector Search Index

**File:** `src/config/vector-index.json`

**Purpose:** Semantic similarity search using embeddings

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

### Field Explanation

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `path` | `embeddings` | Field containing the embedding vector |
| `type` | `vector` | Marks this as a vector field |
| `numDimensions` | `1024` | Vector size (Mistral embed = 1024) |
| `similarity` | `cosine` | Distance metric (cosine similarity) |

### How to Create in MongoDB Atlas

```bash
# Using MongoDB Atlas Web UI:
# 1. Go to Database → Collections → Your Collection
# 2. Click "Search Indexes" tab
# 3. Click "Create Index"
# 4. Select "JSON Editor"
# 5. Copy the JSON below and paste
# 6. Name it: "vector_search_index"
# 7. Click "Create Index"

# Using MongoDB Shell (mongosh):
db.your_collection.collection.createSearchIndex([
  {
    "name": "vector_search_index",
    "type": "vectorSearch",
    "definition": {
      "fields": [
        {
          "path": "embeddings",
          "type": "vector",
          "numDimensions": 1024,
          "similarity": "cosine"
        }
      ]
    }
  }
])
```

---

## 3️⃣ Complete MongoDB Setup Script

**For Node.js/JavaScript:**

```javascript
/**
 * MongoDB Index Setup Script
 * Creates both BM25 and Vector Search indexes
 */

import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

async function setupIndexes() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    console.log('🔍 Creating BM25 Search Index...');
    const bm25IndexResult = await collection.collection.createSearchIndex([
      {
        "name": "bm25_search_index",
        "type": "search",
        "definition": {
          "mappings": {
            "fields": [
              { "path": "id", "type": "string" },
              { "path": "title", "type": "string" },
              { "path": "description", "type": "string" },
              { "path": "module", "type": "string" },
              { "path": "steps", "type": "stringFacet" },
              { "path": "expectedResults", "type": "stringFacet" }
            ]
          }
        }
      }
    ]);
    console.log('✅ BM25 Index Created:', bm25IndexResult);

    console.log('\n🔍 Creating Vector Search Index...');
    const vectorIndexResult = await collection.collection.createSearchIndex([
      {
        "name": "vector_search_index",
        "type": "vectorSearch",
        "definition": {
          "fields": [
            {
              "path": "embeddings",
              "type": "vector",
              "numDimensions": 1024,
              "similarity": "cosine"
            }
          ]
        }
      }
    ]);
    console.log('✅ Vector Index Created:', vectorIndexResult);

    console.log('\n✨ All indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  } finally {
    await client.close();
  }
}

setupIndexes();
```

---

## 4️⃣ MongoDB Document Structure

Your documents in MongoDB should have this structure:

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "id": "TC-001",
  "page_id": "7340033",
  "page_title": "Test Plans - Payment Module UAT",
  "title": "Payment Initiation - Valid Card",
  "description": "Validate payment can be initiated with valid card details",
  "module": "Payment Processing",
  "steps": [
    "User navigates to checkout",
    "User enters valid card details",
    "User clicks submit payment button",
    "System processes payment"
  ],
  "expectedResults": [
    "Payment succeeds",
    "Confirmation email received",
    "Transaction logged"
  ],
  "preRequisites": [
    "Browser open",
    "Items in cart"
  ],
  "embeddings": [0.123, 0.456, ..., 0.891],  // 1024 dimensions
  "source_url": "https://prishan90.atlassian.net/wiki/pages/7340033",
  "labels": ["Payment", "UAT", "Regression"],
  "last_updated": ISODate("2026-01-29T09:19:32.929Z"),
  "created_date": ISODate("2026-01-29T09:19:32.929Z"),
  "version_number": 1
}
```

---

## 5️⃣ MongoDB Atlas Setup Steps

### Step 1: Access Your Cluster
1. Go to MongoDB Atlas (https://cloud.mongodb.com)
2. Select your cluster
3. Go to "Collections" tab

### Step 2: Create BM25 Index
```
Database → Collections → test_cases → Search Indexes → Create Index
Name: bm25_search_index
Type: Search
Copy the BM25 JSON config above
Click "Create Index"
```

### Step 3: Create Vector Index
```
Database → Collections → test_cases → Search Indexes → Create Index
Name: vector_search_index
Type: Vector Search
Copy the Vector JSON config above
Click "Create Index"
```

### Step 4: Wait for Index Creation
- Indexes take 1-5 minutes to build
- Status will show "Active" when ready

### Step 5: Verify Indexes
```bash
# In mongosh
db.test_cases.getSearchIndexes()

# Should output:
# [
#   { name: 'bm25_search_index', ... },
#   { name: 'vector_search_index', ... }
# ]
```

---

## 6️⃣ Query Examples

### BM25 Search Query
```javascript
const results = await collection.aggregate([
  {
    $search: {
      "search": {
        "query": "payment timeout",
        "path": ["title", "description", "steps"]
      }
    }
  },
  {
    $project: {
      "title": 1,
      "description": 1,
      "score": { $meta: "searchScore" }
    }
  },
  { $limit: 10 }
]).toArray();
```

### Vector Search Query
```javascript
const queryEmbedding = [0.234, 0.567, ..., 0.891]; // 1024 dims

const results = await collection.aggregate([
  {
    $search: {
      "cosmineSearch": {
        "vector": queryEmbedding,
        "path": "embeddings",
        "k": 20
      }
    }
  },
  {
    $project: {
      "title": 1,
      "description": 1,
      "similarity": { $meta: "searchScore" }
    }
  }
]).toArray();
```

### Hybrid Search (BM25 + Vector)
```javascript
const queryEmbedding = [0.234, 0.567, ..., 0.891];

// BM25 Results
const bm25Results = await collection.aggregate([
  {
    $search: {
      "search": {
        "query": "payment timeout",
        "path": ["title", "description"]
      }
    }
  },
  { $limit: 20 }
]).toArray();

// Vector Results
const vectorResults = await collection.aggregate([
  {
    $search: {
      "cosmineSearch": {
        "vector": queryEmbedding,
        "path": "embeddings",
        "k": 20
      }
    }
  }
]).toArray();

// Combine and rank
const combined = [...new Map([
  ...bm25Results.map(r => [r._id, r]),
  ...vectorResults.map(r => [r._id, r])
].map(([id, doc]) => [id, doc])).values()];
```

---

## 7️⃣ Environment Variables (.env)

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true
DB_NAME=qa_chatbot
COLLECTION_NAME=test_cases

# Or for Confluence pages
COLLECTION_NAME=confluence_pages
```

---

## 8️⃣ Field Mapping for Confluence Pages

When inserting Confluence extracted pages into MongoDB:

```javascript
{
  "page_id": "7340033",           // From Confluence API
  "title": "Test Plans - Payment Module UAT",  // page_title → title
  "description": "...",           // Summary of content
  "module": "Payment",            // From labels or content
  "steps": ["...", "..."],        // Extracted sections
  "expectedResults": ["..."],     // Extracted sections
  "embeddings": [...],            // Generated by Mistral
  "source_url": "https://...",    // Direct Confluence link
  "labels": ["UAT", "Payment"],   // From Confluence labels
  "last_updated": ISODate(),      // From created_date
  "version_number": 1             // From Confluence version
}
```

---

## 9️⃣ Troubleshooting

### Index Not Showing
```bash
# Verify indexes exist
db.test_cases.getSearchIndexes()

# Delete and recreate if needed
db.test_cases.dropSearchIndex("bm25_search_index")
```

### Vector Search Returning No Results
- ✅ Verify embeddings field contains 1024 dimensions
- ✅ Check vector index is "Active" (not "Building")
- ✅ Confirm query vector also has 1024 dimensions

### BM25 Search Returning No Results
- ✅ Verify fields exist in documents
- ✅ Check index status is "Active"
- ✅ Ensure search query path matches field names

### Index Creation Timeout
- ✅ Large collections take longer (>1M documents)
- ✅ Check MongoDB Atlas cluster resources
- ✅ Consider creating during off-peak hours

---

## 🔟 Quick Reference

| Feature | Index | Query | Speed |
|---------|-------|-------|-------|
| **Keyword Search** | BM25 | `$search` | ⚡ Fast (100-200ms) |
| **Semantic Search** | Vector | `cosmineSearch` | ⚡ Fast (150-300ms) |
| **Combined** | Both | Both in parallel | ⚡⚡ Very fast (200-400ms) |

---

**Created:** 2026-01-29  
**Status:** ✅ Ready to use  
**Version:** 1.0.0
