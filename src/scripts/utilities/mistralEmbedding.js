/**
 * Mistral AI Embedding Utility
 * Generates embeddings using Mistral's embedding model
 */

import axios from 'axios';
import dotenv from 'dotenv';
import logger from './logger.js';
import { EmbeddingError } from './errorHandler.js';

dotenv.config();

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_EMBEDDING_MODEL = process.env.MISTRAL_EMBEDDING_MODEL || 'mistral-embed';
const MISTRAL_API_BASE = 'https://api.mistral.ai/v1';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function validateConfig() {
  if (!MISTRAL_API_KEY) {
    throw new EmbeddingError('MISTRAL_API_KEY is required in .env file');
  }
}

/**
 * Generate embedding for a single text
 * @param {string} text - Text to embed
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} Object with embedding array and metadata
 */
export async function generateEmbedding(text, retryCount = 0) {
  validateConfig();

  if (!text || typeof text !== 'string') {
    throw new EmbeddingError('Text must be a non-empty string');
  }

  try {
    const response = await axios.post(
      `${MISTRAL_API_BASE}/embeddings`,
      {
        model: MISTRAL_EMBEDDING_MODEL,
        input: [text]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_API_KEY}`
        },
        timeout: 30000
      }
    );

    if (!response.data?.data?.[0]?.embedding) {
      throw new EmbeddingError('Invalid response structure from Mistral API');
    }

    return {
      embedding: response.data.data[0].embedding,
      model: response.data.model,
      usage: response.data.usage || {}
    };
  } catch (error) {
    if (retryCount < MAX_RETRIES && (error.code === 'ECONNREFUSED' || error.response?.status >= 500)) {
      logger.warn(`Embedding generation failed, retry ${retryCount + 1}/${MAX_RETRIES}`, { error: error.message });
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * Math.pow(2, retryCount)));
      return generateEmbedding(text, retryCount + 1);
    }
    throw new EmbeddingError(`Failed to generate embedding: ${error.message}`, { originalError: error.toString() });
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {Array<string>} texts - Array of texts to embed
 * @param {number} batchSize - Number of texts to process in parallel
 * @returns {Promise<Array>} Array of embedding objects
 */
export async function generateBatchEmbeddings(texts, batchSize = 10) {
  validateConfig();

  if (!Array.isArray(texts) || texts.length === 0) {
    throw new EmbeddingError('Texts must be a non-empty array');
  }

  logger.info(`Generating embeddings for ${texts.length} texts (batch size: ${batchSize})`);
  const results = [];
  const failed = [];

  try {
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, Math.min(i + batchSize, texts.length));
      logger.debug(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(texts.length / batchSize)}`);

      const batchPromises = batch.map((text, index) =>
        generateEmbedding(text)
          .then(result => ({
            index: i + index,
            text: text,
            embedding: result.embedding,
            success: true
          }))
          .catch(error => {
            failed.push({
              index: i + index,
              text: text,
              error: error.message
            });
            logger.warn(`Failed to embed text at index ${i + index}: ${error.message}`);
            return null;
          })
      );

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(r => r !== null));

      // Rate limiting
      if (i + batchSize < texts.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    logger.success(`Embedding generation complete. Success: ${results.length}, Failed: ${failed.length}`);
    
    return {
      embeddings: results,
      failed: failed,
      totalProcessed: results.length,
      totalFailed: failed.length
    };
  } catch (error) {
    throw new EmbeddingError(`Batch embedding failed: ${error.message}`, { totalProcessed: results.length, failed });
  }
}

export default {
  generateEmbedding,
  generateBatchEmbeddings
};
