/**
 * Hybrid Search
 * Combines BM25 and Vector search with score fusion
 */

import { bm25Search } from './bm25-search.js';
import { vectorSearch } from './vector-search.js';
import logger from '../utilities/logger.js';
import { SearchError } from '../utilities/errorHandler.js';

/**
 * Normalize scores to 0-1 range
 */
function normalizeScore(score, min, max) {
  if (max === min) return 0.5;
  return (score - min) / (max - min);
}

/**
 * Perform hybrid search with score fusion
 */
export async function hybridSearch(query, options = {}) {
  if (!query || typeof query !== 'string') {
    throw new SearchError('Query must be a non-empty string');
  }

  try {
    const {
      limit = 10,
      weights = { bm25: 0.6, vector: 0.4 },
      filters = {}
    } = options;

    logger.info(`🔀 Hybrid Search: "${query}" (BM25: ${weights.bm25}, Vector: ${weights.vector})`);

    // Execute BM25 and Vector searches in parallel
    const [bm25Result, vectorResult] = await Promise.all([
      bm25Search(query, { limit: 20, filters }),
      vectorSearch(query, { limit: 20, filters })
    ]);

    logger.debug(`BM25 returned ${bm25Result.count} results, Vector returned ${vectorResult.count} results`);

    // Create document map with scores
    const docMap = new Map();
    const bm25Scores = [];
    const vectorScores = [];

    // Add BM25 results
    bm25Result.results.forEach(doc => {
      const score = doc.score || 0;
      bm25Scores.push(score);
      docMap.set(doc.id, {
        ...doc,
        bm25Score: score,
        vectorScore: 0,
        fusedScore: 0
      });
    });

    // Add Vector results
    vectorResult.results.forEach(doc => {
      const score = doc.score || 0;
      vectorScores.push(score);
      if (docMap.has(doc.id)) {
        docMap.get(doc.id).vectorScore = score;
      } else {
        docMap.set(doc.id, {
          ...doc,
          bm25Score: 0,
          vectorScore: score,
          fusedScore: 0
        });
      }
    });

    // Normalize scores
    const bm25Min = Math.min(...bm25Scores);
    const bm25Max = Math.max(...bm25Scores);
    const vectorMin = Math.min(...vectorScores);
    const vectorMax = Math.max(...vectorScores);

    // Calculate fused scores
    const fusedResults = Array.from(docMap.values()).map(doc => {
      const normBm25 = normalizeScore(doc.bm25Score, bm25Min, bm25Max);
      const normVector = normalizeScore(doc.vectorScore, vectorMin, vectorMax);
      
      doc.fusedScore = (weights.bm25 * normBm25) + (weights.vector * normVector);
      return doc;
    });

    // Sort by fused score and limit
    const ranked = fusedResults
      .sort((a, b) => b.fusedScore - a.fusedScore)
      .slice(0, limit);

    logger.success(`✅ Hybrid search returned ${ranked.length} fused results`);

    return {
      query,
      results: ranked,
      count: ranked.length,
      fusionWeights: weights,
      processingTime: Date.now(),
      searchType: 'hybrid'
    };
  } catch (error) {
    logger.error('Hybrid search failed:', error.message);
    throw new SearchError(`Hybrid search failed: ${error.message}`, {
      query,
      originalError: error.toString()
    });
  }
}

export default {
  hybridSearch
};
