/**
 * QA ChatBot RAG - Example Usage Patterns
 * Reference implementation for common use cases
 */

// ==================== EXAMPLE 1: Complete RAG Pipeline ====================

/**
 * Execute full RAG pipeline with all components
 * Best for: Production queries requiring best results
 */

const fullRAGExample = {
  endpoint: 'POST /api/rag',
  request: {
    query: 'What are negative test cases for payment timeout?',
    options: {
      enablePreprocessing: true,
      enableReranking: true,
      enableSummarization: true,
      searchLimit: 5
    }
  },
  curl: `curl -X POST http://localhost:3001/api/rag \\
    -H "Content-Type: application/json" \\
    -d '{
      "query": "What are negative test cases for payment timeout?",
      "options": {
        "enablePreprocessing": true,
        "enableReranking": true,
        "enableSummarization": true,
        "searchLimit": 5
      }
    }'`,
  response: {
    userQuery: 'What are negative test cases for payment timeout?',
    answer: 'The negative test scenarios for payment timeout include: (1) Network failure during payment initiation with automatic retry, (2) Session timeout after 30 minutes preventing payment, and (3) Invalid gateway response handling.',
    sources: [
      {
        id: 'TC-503',
        title: 'Payment Timeout - Network Failure',
        score: 0.94
      }
    ],
    processingTime: 2800
  }
};

// ==================== EXAMPLE 2: Fast Search Only ====================

/**
 * Hybrid search without preprocessing or reranking
 * Best for: Quick searches, autocomplete, high-throughput
 */

const fastSearchExample = {
  endpoint: 'POST /api/search/hybrid',
  request: {
    query: 'payment timeout',
    limit: 10,
    weights: { bm25: 0.6, vector: 0.4 }
  },
  curl: `curl -X POST http://localhost:3001/api/search/hybrid \\
    -H "Content-Type: application/json" \\
    -d '{"query":"payment timeout","limit":10}'`,
  response: {
    results: [
      {
        id: 'TC-503',
        title: 'Payment Timeout - Network Failure',
        description: 'Test network failure scenarios',
        fusedScore: 0.94
      }
    ],
    count: 5,
    processingTime: 250
  }
};

// ==================== EXAMPLE 3: Query Preprocessing Only ====================

/**
 * Preprocess query to see expansion variations
 * Best for: Understanding query transformation
 */

const preprocessingExample = {
  endpoint: 'POST /api/preprocess',
  request: {
    query: 'TC-001 negative UAT test cases',
    options: {
      enableAbbreviations: true,
      enableSynonyms: true,
      maxSynonymVariations: 5
    }
  },
  curl: `curl -X POST http://localhost:3001/api/preprocess \\
    -H "Content-Type: application/json" \\
    -d '{"query":"TC-001 negative UAT test cases"}'`,
  response: {
    original: 'TC-001 negative UAT test cases',
    normalized: 'tc-001 negative uat test cases',
    abbreviationExpanded: 'test case-001 negative user acceptance testing test cases',
    synonymExpanded: [
      'test case-001 invalid user acceptance testing test cases',
      'test case-001 error user acceptance testing test scenarios'
    ],
    extractedTestCaseIds: ['TC-001'],
    metadata: {
      processingTime: 45,
      abbreviationsExpanded: 2,
      synonymVariationsGenerated: 2
    }
  }
};

// ==================== EXAMPLE 4: BM25 Keyword Search ====================

/**
 * Pure keyword search using BM25
 * Best for: Exact phrase matching
 */

const bm25Example = {
  endpoint: 'POST /api/search/bm25',
  request: {
    query: 'payment gateway timeout error',
    limit: 10
  },
  curl: `curl -X POST http://localhost:3001/api/search/bm25 \\
    -H "Content-Type: application/json" \\
    -d '{"query":"payment gateway timeout error","limit":10}'`,
  response: {
    query: 'payment gateway timeout error',
    results: [
      {
        id: 'TC-503',
        title: 'Payment Timeout - Network Failure',
        score: 8.5
      }
    ],
    count: 3,
    searchType: 'bm25',
    processingTime: 120
  }
};

// ==================== EXAMPLE 5: Vector Semantic Search ====================

/**
 * Semantic search using embeddings
 * Best for: Paraphrased queries
 */

const vectorExample = {
  endpoint: 'POST /api/search/vector',
  request: {
    query: 'how do we handle payment delays?',
    limit: 10
  },
  curl: `curl -X POST http://localhost:3001/api/search/vector \\
    -H "Content-Type: application/json" \\
    -d '{"query":"how do we handle payment delays?","limit":10}'`,
  response: {
    query: 'how do we handle payment delays?',
    results: [
      {
        id: 'TC-510',
        title: 'Invalid Payment Gateway Response',
        similarity: 0.89
      }
    ],
    count: 4,
    searchType: 'vector',
    processingTime: 200
  }
};

// ==================== EXAMPLE 6: LLM Reranking ====================

/**
 * Search with intelligent LLM reranking
 * Best for: Complex queries needing semantic understanding
 */

const rerankingExample = {
  endpoint: 'POST /api/search/rerank',
  request: {
    query: 'payment timeout',
    limit: 5,
    initialLimit: 15
  },
  curl: `curl -X POST http://localhost:3001/api/search/rerank \\
    -H "Content-Type: application/json" \\
    -d '{"query":"payment timeout","limit":5}'`,
  response: {
    query: 'payment timeout',
    results: [
      {
        id: 'TC-503',
        title: 'Payment Timeout - Network Failure',
        rerankScore: 0.96,
        rerankReason: 'Directly addresses timeout with specific failure scenario'
      }
    ],
    count: 5,
    searchType: 'reranking',
    processingTime: 1200
  }
};

// ==================== EXAMPLE 7: Batch Embedding Creation ====================

/**
 * Generate embeddings for documents
 * Best for: Initial data loading
 */

const embeddingExample = {
  endpoint: 'POST /api/embeddings/create',
  request: {
    documents: [
      {
        id: 'TC-001',
        title: 'Login Test',
        description: 'Test user login flow',
        module: 'Authentication'
      }
    ],
    batchSize: 100
  },
  curl: `curl -X POST http://localhost:3001/api/embeddings/create \\
    -H "Content-Type: application/json" \\
    -d '{"documents":[...],"batchSize":100}'`,
  response: {
    totalProcessed: 100,
    totalFailed: 0,
    updated: 100,
    failed: []
  }
};

// ==================== EXAMPLE 8: System Statistics ====================

/**
 * Get system status and statistics
 * Best for: Monitoring and health checks
 */

const statsExample = {
  endpoint: 'GET /api/stats',
  curl: `curl http://localhost:3001/api/stats`,
  response: {
    totalDocuments: 250,
    documentsWithEmbeddings: 245,
    embeddingsPercentage: '98.00'
  }
};

// ==================== NODEJS USAGE EXAMPLES ====================

/**
 * Using the RAG system programmatically from Node.js
 */

// Example 1: Using the local RAG pipeline directly
import { executeRAGPipeline } from './src/scripts/rag-pipeline.js';

async function example1() {
  try {
    const result = await executeRAGPipeline(
      'What are negative test cases for payment?',
      {
        enablePreprocessing: true,
        enableReranking: true,
        enableSummarization: true,
        searchLimit: 5
      }
    );
    console.log(result.answer);
    console.log(result.sources);
  } catch (error) {
    console.error(error);
  }
}

// Example 2: Using individual components
import { preprocessQuery } from './src/scripts/query-preprocessing/queryPreprocessor.js';
import { hybridSearch } from './src/scripts/search/hybrid-search.js';
import { rerankingSearch } from './src/scripts/search/rerank-search.js';

async function example2() {
  // Preprocess
  const preprocessed = preprocessQuery('payment timeout test cases');
  console.log('Variations:', preprocessed.synonymExpanded);

  // Search
  const results = await hybridSearch(preprocessed.synonymExpanded[0]);
  console.log('Results:', results.count);

  // Rerank
  const reranked = await rerankingSearch(preprocessed.synonymExpanded[0]);
  console.log('Top result:', reranked.results[0].title);
}

// Example 3: Calling the API server
import axios from 'axios';

async function example3() {
  const response = await axios.post('http://localhost:3001/api/rag', {
    query: 'What are the test cases for payment processing?',
    options: {
      enablePreprocessing: true,
      enableReranking: true,
      enableSummarization: true,
      searchLimit: 5
    }
  });

  console.log(response.data.answer);
}

// ==================== PERFORMANCE COMPARISON ====================

/**
 * Typical response times for different approaches
 */

const performanceComparison = {
  approaches: [
    {
      name: 'BM25 Only',
      processingTime: '100-200ms',
      useCase: 'Quick keyword search',
      quality: 'Medium'
    },
    {
      name: 'Vector Only',
      processingTime: '150-300ms',
      useCase: 'Semantic search',
      quality: 'Medium'
    },
    {
      name: 'Hybrid (BM25+Vector)',
      processingTime: '200-400ms',
      useCase: 'Balanced approach',
      quality: 'High'
    },
    {
      name: 'Hybrid + Reranking',
      processingTime: '1000-1500ms',
      useCase: 'Better relevance',
      quality: 'Very High'
    },
    {
      name: 'Full RAG (Preprocess → Search → Rerank → Summarize)',
      processingTime: '2500-4500ms',
      useCase: 'Production QA',
      quality: 'Excellent'
    }
  ]
};

export default {
  fullRAGExample,
  fastSearchExample,
  preprocessingExample,
  bm25Example,
  vectorExample,
  rerankingExample,
  embeddingExample,
  statsExample,
  performanceComparison
};
