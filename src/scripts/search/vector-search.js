/**
 * Vector Search (Semantic Search)
 * Uses embeddings to find semantically similar documents
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { generateEmbedding } from '../utilities/mistralEmbedding.js';
import logger from '../utilities/logger.js';
import { SearchError } from '../utilities/errorHandler.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;
const VECTOR_INDEX_NAME = process.env.VECTOR_INDEX_NAME || 'vector_index_test_cases';

/**
 * Perform vector similarity search
 */
export async function vectorSearch(query, options = {}) {
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
      limit = 20,
      filters = {}
    } = options;

    logger.info(`🔎 Vector Search: "${query}" (limit: ${limit})`);

    // Generate query embedding
    logger.debug('Generating query embedding...');
    const embeddingResult = await generateEmbedding(query);
    const queryEmbedding = embeddingResult.embedding;

    // Build vector search pipeline
    const pipeline = [
      {
        $search: {
          cosmineSearch: {
            vector: queryEmbedding,
            path: 'embeddings',
            k: limit,
            efConstruction: 200
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

    logger.success(`✅ Vector search returned ${results.length} results`);

    return {
      query,
      results,
      count: results.length,
      processingTime: Date.now(),
      searchType: 'vector'
    };
  } catch (error) {
    logger.error('Vector search failed:', error.message);
    throw new SearchError(`Vector search failed: ${error.message}`, {
      query,
      originalError: error.toString()
    });
  } finally {
    await client.close();
  }
}

export default {
  vectorSearch
};
