/**
 * BM25 Full-Text Search
 * Keyword-based search with field-level weighting
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import logger from '../utilities/logger.js';
import { SearchError, DatabaseError } from '../utilities/errorHandler.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;
const BM25_INDEX_NAME = process.env.BM25_INDEX_NAME || 'bm25_index_test_cases';

/**
 * Perform BM25 search with field weighting
 */
export async function bm25Search(query, options = {}) {
  if (!query || typeof query !== 'string') {
    throw new SearchError('Query must be a non-empty string');
  }

  const client = new MongoClient(MONGODB_URI, {
    ssl: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000
  });

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const {
      limit = 10,
      filters = {},
      fieldWeights = {
        id: 10.0,
        title: 5.0,
        module: 3.0,
        description: 2.0,
        steps: 1.0
      }
    } = options;

    logger.info(`🔤 BM25 Search: "${query}" (limit: ${limit})`);

    // Build BM25 search with field weights
    const searchFields = Object.entries(fieldWeights).map(([field, weight]) => ({
      text: {
        query: query,
        path: field,
        score: { boost: { value: weight } }
      }
    }));

    const pipeline = [
      {
        $search: {
          compound: {
            should: searchFields,
            minimumShouldMatch: 1
          }
        }
      },
      { $limit: limit },
      {
        $project: {
          score: { $meta: 'searchScore' },
          _id: 1,
          id: 1,
          title: 1,
          description: 1,
          module: 1,
          steps: 1,
          expectedResults: 1
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();

    logger.success(`✅ BM25 search returned ${results.length} results`);

    return {
      query,
      results,
      count: results.length,
      processingTime: Date.now(),
      searchType: 'bm25'
    };
  } catch (error) {
    logger.error('BM25 search failed:', error.message);
    throw new SearchError(`BM25 search failed: ${error.message}`, {
      query,
      originalError: error.toString()
    });
  } finally {
    await client.close();
  }
}

export default {
  bm25Search
};
