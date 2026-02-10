/**
 * Reranking Search
 * Uses LLM to rerank search results for improved relevance
 */

import { hybridSearch } from './hybrid-search.js';
import { rerankDocuments } from '../utilities/groqClient.js';
import logger from '../utilities/logger.js';
import { SearchError } from '../utilities/errorHandler.js';

/**
 * Perform search with LLM reranking
 */
export async function rerankingSearch(query, options = {}) {
  if (!query || typeof query !== 'string') {
    throw new SearchError('Query must be a non-empty string');
  }

  try {
    const {
      limit = 5,
      initialLimit = 15,
      filters = {},
      weights = { bm25: 0.6, vector: 0.4 }
    } = options;

    logger.info(`🏆 Reranking Search: "${query}" (initial: ${initialLimit}, final: ${limit})`);

    // Step 1: Get initial hybrid results
    logger.debug('Step 1: Performing hybrid search...');
    const hybridResult = await hybridSearch(query, {
      limit: initialLimit,
      weights,
      filters
    });

    // Step 2: Rerank with LLM
    logger.debug(`Step 2: Reranking ${hybridResult.results.length} results with LLM...`);
    const reranked = await rerankDocuments(query, hybridResult.results, limit);

    // Map reranked results back to full documents
    const finalResults = reranked.rankings.map(ranking => {
      const originalDoc = hybridResult.results.find(r => r.id === ranking.doc_id);
      return {
        ...originalDoc,
        rerankScore: ranking.relevance_score,
        rerankReason: ranking.reason,
        finalRank: ranking.rank
      };
    });

    logger.success(`✅ Reranking search returned ${finalResults.length} results`);

    return {
      query,
      results: finalResults,
      count: finalResults.length,
      processingTime: Date.now(),
      searchType: 'reranking',
      metadata: {
        initialResultsCount: hybridResult.count,
        finalResultsCount: finalResults.length
      }
    };
  } catch (error) {
    logger.error('Reranking search failed:', error.message);
    throw new SearchError(`Reranking search failed: ${error.message}`, {
      query,
      originalError: error.toString()
    });
  }
}

export default {
  rerankingSearch
};
