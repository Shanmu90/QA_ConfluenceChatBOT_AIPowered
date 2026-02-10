/**
 * RAG Pipeline Orchestrator
 * Main orchestrator combining all RAG components
 */

import { preprocessQuery } from './query-preprocessing/queryPreprocessor.js';
import { rerankingSearch } from './search/rerank-search.js';
import { hybridSearch } from './search/hybrid-search.js';
import { summarizeResults } from './utilities/groqClient.js';
import logger from './utilities/logger.js';
import { RAGError } from './utilities/errorHandler.js';

/**
 * Complete RAG pipeline: preprocess → search → rerank → summarize
 */
export async function executeRAGPipeline(userQuery, options = {}) {
  const startTime = Date.now();
  const results = {
    userQuery,
    timestamp: new Date().toISOString(),
    stages: {}
  };

  try {
    logger.info('🚀 Starting RAG Pipeline');
    logger.info(`Query: "${userQuery}"`);

    const {
      enablePreprocessing = true,
      enableReranking = true,
      enableSummarization = true,
      searchLimit = 5,
      hybridWeights = { bm25: 0.6, vector: 0.4 }
    } = options;

    // STAGE 1: Query Preprocessing
    logger.info('\n📝 STAGE 1: Query Preprocessing');
    let processedQuery = userQuery;
    if (enablePreprocessing) {
      const preprocessResult = preprocessQuery(userQuery);
      results.stages.preprocessing = preprocessResult;
      processedQuery = preprocessResult.synonymExpanded[0] || userQuery;
      logger.info(`Variations generated: ${preprocessResult.synonymExpanded.length}`);
    }

    // STAGE 2: Search (Hybrid with optional Reranking)
    logger.info('\n🔍 STAGE 2: Search & Retrieval');
    let searchResult;
    if (enableReranking) {
      searchResult = await rerankingSearch(userQuery, {
        limit: searchLimit,
        weights: hybridWeights
      });
      logger.info(`Reranked results: ${searchResult.count}`);
    } else {
      searchResult = await hybridSearch(userQuery, {
        limit: searchLimit * 2,
        weights: hybridWeights
      });
      logger.info(`Hybrid search results: ${searchResult.count}`);
    }
    results.stages.search = searchResult;

    // STAGE 3: Summarization
    logger.info('\n✍️ STAGE 3: Answer Generation');
    let finalAnswer = null;
    if (enableSummarization && searchResult.results.length > 0) {
      const summaryResult = await summarizeResults(userQuery, searchResult.results);
      results.stages.summarization = summaryResult;
      finalAnswer = summaryResult.summary;
      logger.info('✅ Answer generated');
    }

    // Build final response
    results.answer = finalAnswer || 'No relevant documents found';
    results.sources = searchResult.results.slice(0, 3).map(r => ({
      id: r.id,
      title: r.title,
      score: r.fusedScore || r.score
    }));
    results.processingTime = Date.now() - startTime;

    logger.success(`\n✨ RAG Pipeline Complete (${results.processingTime}ms)`);
    logger.success(`Answer: ${results.answer.substring(0, 100)}...`);

    return results;
  } catch (error) {
    logger.error('RAG Pipeline failed:', error.message);
    results.error = error.message;
    results.processingTime = Date.now() - startTime;
    throw new RAGError(`RAG Pipeline failed: ${error.message}`, 'RAG_PIPELINE_ERROR', 500, {
      userQuery,
      processingTime: results.processingTime
    });
  }
}

/**
 * Simple search-only pipeline (without preprocessing/summarization)
 */
export async function quickSearch(query, searchType = 'hybrid') {
  try {
    logger.info(`⚡ Quick Search (${searchType}): "${query}"`);

    let searchResult;
    if (searchType === 'reranking') {
      const { rerankingSearch } = await import('../search/rerank-search.js');
      searchResult = await rerankingSearch(query);
    } else if (searchType === 'bm25') {
      const { bm25Search } = await import('../search/bm25-search.js');
      searchResult = await bm25Search(query);
    } else if (searchType === 'vector') {
      const { vectorSearch } = await import('../search/vector-search.js');
      searchResult = await vectorSearch(query);
    } else {
      const { hybridSearch } = await import('../search/hybrid-search.js');
      searchResult = await hybridSearch(query);
    }

    logger.success(`✅ Found ${searchResult.count} results`);
    return searchResult;
  } catch (error) {
    logger.error('Quick search failed:', error.message);
    throw error;
  }
}

export default {
  executeRAGPipeline,
  quickSearch
};
