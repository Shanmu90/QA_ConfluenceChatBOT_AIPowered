# QA ChatBot - Validation Guide & Sample Questions

## Overview
This document provides sample questions to validate the end-to-end RAG pipeline. Each question is designed to test different aspects of the system (keyword search, semantic search, filtering, and LLM reranking).

---

## Sample Validation Questions

### 1. **Simple Keyword Query**
**Question:** `What are the negative payment test cases?`

**Category:** Test Cases  
**Search Type:** BM25 (Full-Text Keyword Search)  
**Expected Behavior:**
- Should match documents containing "negative" and "payment"
- Will return pages from "Test Plans" or "Test Cases" sections
- Source should show which document contains this information

**Expected Answer Pattern:**
```
Based on the QA documentation, negative test cases for payment include:
- Invalid payment amounts (negative, zero, extremely large)
- Expired card information
- Insufficient funds scenarios
- Invalid CVV/CVC codes
- Network timeout handling
- Payment processing failures
- Declined transaction responses
```

**Source Documents:** Test Plans, Test Cases, Regression Scope

---

### 2. **Semantic Query (Conceptual)**
**Question:** `How do we handle payment failures?`

**Category:** Error Handling  
**Search Type:** Vector Search (Semantic Similarity)  
**Expected Behavior:**
- Will find documents even if exact keywords don't match
- Should return pages about error scenarios, recovery, and exception handling
- Vector search finds semantically similar content

**Expected Answer Pattern:**
```
Payment failure handling involves:
- Detecting failure responses from payment gateway
- Logging transaction details for audit trail
- Retrying failed transactions (with exponential backoff)
- Notifying users of transaction status
- Rolling back any partial transactions
- Escalating critical failures to support team
- Providing fallback payment methods to users
```

**Source Documents:** Test Strategy, Error Handling procedures

---

### 3. **Security & Compliance Query**
**Question:** `What are the security requirements?`

**Category:** Requirements  
**Search Type:** Hybrid (BM25 + Vector)  
**Expected Behavior:**
- Returns both exact keyword matches and semantically related documents
- Filters by "security" labels if available
- Reranks results by relevance

**Expected Answer Pattern:**
```
Security requirements for payment processing include:
- PCI DSS compliance (Level 1)
- Data encryption (TLS 1.2+)
- Secure credential storage (hashed passwords)
- Authentication and authorization checks
- Audit logging for all transactions
- Regular security testing
- Vulnerability scanning
- API rate limiting and DDoS protection
```

**Source Documents:** Security Requirements, Compliance Documentation

---

### 4. **Multi-Document Query**
**Question:** `What is the regression scope and how do we test it?`

**Category:** Regression  
**Search Type:** Hybrid Search with Reranking  
**Expected Behavior:**
- Requires aggregating information from multiple documents
- LLM should combine answers from different sources
- Shows multiple source documents

**Expected Answer Pattern:**
```
The regression scope covers:
1. Payment Processing Module
   - All payment methods (credit card, debit, net banking)
   - Happy path and error scenarios
   - Edge cases and boundary conditions

2. Testing Approach
   - Unit tests for individual functions
   - Integration tests for payment gateway communication
   - End-to-end tests for complete payment flow
   - Performance tests for high-volume scenarios
   - Security tests for vulnerability assessment

3. Coverage Areas
   - Transaction validation
   - Error handling and recovery
   - Audit logging
   - Concurrent payment processing
```

**Source Documents:** Regression Scope, Test Strategy, Test Plans

---

### 5. **Specific Document Query**
**Question:** `Tell me about the test plans for payment module`

**Category:** Test Planning  
**Search Type:** Full-Text + Semantic  
**Expected Behavior:**
- Should return the dedicated "Test Plans" document
- Extracts relevant sections from the document
- Highlights key test scenarios

**Expected Answer Pattern:**
```
Payment Module Test Plans include:

1. Scope: Comprehensive testing of all payment processing flows

2. Test Scenarios:
   - Credit card payments
   - Debit card transactions
   - Net banking payments
   - Digital wallet integration
   - Payment cancellation and refunds

3. Test Levels:
   - Unit testing
   - Integration testing
   - System testing
   - User acceptance testing

4. Success Criteria:
   - All critical test cases pass
   - No high-severity defects
   - Performance meets SLA requirements
```

**Source Documents:** Test Plans

---

### 6. **Update/Change Query**
**Question:** `What was changed in the latest release?`

**Category:** Release Management  
**Search Type:** Keyword + Semantic  
**Expected Behavior:**
- Searches Release Notes document
- Returns version-specific information
- Highlights breaking changes or new features

**Expected Answer Pattern:**
```
Latest Release Notes:
- Version: 2.1.0
- Release Date: [Date]

Key Changes:
- New payment methods support (Google Pay, Apple Pay)
- Improved error messages for users
- Enhanced logging for transactions
- Performance optimization (2x faster processing)
- Security patches for payment validation

Breaking Changes:
- API v1 deprecated (migrate to v2)
- Old card format no longer supported

Migration Guide:
- [Steps for upgrading existing integrations]
```

**Source Documents:** Release Notes

---

### 7. **FAQ Query**
**Question:** `What should I do if a payment is stuck?`

**Category:** Troubleshooting  
**Search Type:** Semantic Search  
**Expected Behavior:**
- Should return FAQ or troubleshooting documents
- Provides step-by-step resolution
- May include support contact information

**Expected Answer Pattern:**
```
If a payment is stuck:

1. Immediate Actions:
   - Check your internet connection
   - Verify payment gateway status
   - Wait 5-10 minutes and retry

2. Diagnostic Steps:
   - Check transaction status in your account
   - Look for confirmation emails
   - Review bank statement for duplicate charges

3. If Still Stuck:
   - Contact our support team with transaction ID
   - Provide payment method details
   - Share error messages received

4. Prevention:
   - Use stable internet connection
   - Avoid closing browser during payment
   - Enable browser notifications for updates
```

**Source Documents:** FAQ, Troubleshooting Guide

---

### 8. **Cross-Module Query**
**Question:** `What are the expected results for payment validation tests?`

**Category:** Test Cases  
**Search Type:** Hybrid with LLM Reranking  
**Expected Behavior:**
- Combines information from Test Plans, Test Cases, and Expected Results docs
- Shows specific assertions and validation logic
- May reference error codes

**Expected Answer Pattern:**
```
Expected Results for Payment Validation:

1. Valid Payment Processing
   - ✓ Payment authorized successfully
   - ✓ Transaction ID generated
   - ✓ Confirmation email sent
   - ✓ Balance updated in account

2. Invalid Input Scenarios
   - ✗ Card number validation fails (error: INVALID_CARD)
   - ✗ Expiry date validation fails (error: EXPIRED_CARD)
   - ✗ CVV validation fails (error: INVALID_CVV)

3. System Error Scenarios
   - ⚠ Timeout handling: Retry after 5 seconds
   - ⚠ Gateway error: Show user-friendly message
   - ⚠ Network error: Queue for later processing

4. Test Assertion Examples
   - assert payment.status == "COMPLETED"
   - assert transaction_id != null
   - assert confirmation_sent == true
   - assert audit_log.entries > 0
```

**Source Documents:** Test Plans, Test Cases, Expected Results

---

## Testing Instructions

### Step 1: Data Ingestion
```bash
1. Open the QA ChatBot UI
2. Go to Tab 1: "📥 Step 1: Ingest Data"
3. Paste Confluence URL or upload JSON file
4. Click "Convert to JSON"
5. Verify JSON output contains all 8 sample documents
```

### Step 2: Embedding Generation
```bash
1. Go to Tab 2: "⚙️ Step 2: Generate Embeddings"
2. Copy JSON from Step 1
3. Paste into the JSON field
4. Click "Generate Embeddings & Ingest to MongoDB"
5. Wait for success message
6. Verify MongoDB shows ingestion count
```

### Step 3: Validation via ChatBot
```bash
1. Go to Tab 3: "💬 Step 3: QA ChatBot"
2. Click on a sample question OR type your own
3. Observe the search results and sources
4. Click on source document chips to see full content
5. Verify answers are relevant and sources are correct
```

---

## Success Criteria

### Keyword Search (BM25)
- ✅ Query "negative payment" returns Test Plans document
- ✅ Query "security requirements" returns Security doc
- ✅ Results ranked by relevance (exact matches first)

### Semantic Search (Vector)
- ✅ Query "How do we handle payment failures?" finds error handling docs
- ✅ Query "Troubleshooting" finds FAQ even without exact match
- ✅ Results are semantically similar to query

### Hybrid Search + Reranking
- ✅ Combined results from both BM25 and Vector searches
- ✅ LLM reranks results by relevance
- ✅ Final answer synthesizes multiple sources

### LLM Answer Generation
- ✅ Answers are coherent and well-structured
- ✅ Answers cite sources correctly
- ✅ Answers are specific to the question asked
- ✅ Answers use information from indexed documents

---

## Troubleshooting

### Issue: No results returned
**Possible Causes:**
- Embeddings not generated yet (check Step 2)
- Query too specific or worded differently
- Documents not indexed in MongoDB

**Solution:**
- Re-run Step 2 to generate embeddings
- Try rephrasing the question
- Verify MongoDB indexes are Active

### Issue: Results are irrelevant
**Possible Causes:**
- Hybrid search weights not optimal
- Reranking not working properly
- Vector embeddings not accurate

**Solution:**
- Check Mistral embedding generation logs
- Verify search weights in hybrid-search.js
- Try simpler, more direct questions

### Issue: Sources are missing
**Possible Causes:**
- Document metadata not properly extracted
- MongoDB field mapping incorrect

**Solution:**
- Check source_url and page_title in MongoDB documents
- Verify index configuration includes filter fields
- Re-ingest with corrected metadata

---

## Expected Document Structure

Each document should have:
```json
{
  "page_id": "string (from Confluence)",
  "page_title": "string (document title)",
  "full_content_text": "string (cleaned content)",
  "module": "string (category: Test Plans, Security, etc.)",
  "labels": ["array", "of", "tags"],
  "source_url": "string (Confluence page URL)",
  "embedding": [1024 numbers] (generated by Mistral)
}
```

---

## Performance Benchmarks

| Query Type | Expected Response Time | Result Count |
|------------|------------------------|----|
| Simple keyword | < 500ms | 3-5 results |
| Semantic search | 500-1000ms | 3-5 results |
| Hybrid + rerank | 1000-2000ms | 3-5 results |
| Full FAQ question | 1500-3000ms | 1-3 results |

---

## Next Steps

1. ✅ Verify all 8 sample questions return relevant results
2. ✅ Add your own test documents and questions
3. ✅ Experiment with query phrasing variations
4. ✅ Test cross-document queries
5. ✅ Deploy to production with real documentation

---

**Document Created:** [Date]  
**Last Updated:** [Current Date]  
**Pipeline Version:** v1.0  
