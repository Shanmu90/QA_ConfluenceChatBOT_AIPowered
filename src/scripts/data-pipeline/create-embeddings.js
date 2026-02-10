/**
 * Create Embeddings
 * Generates and stores embeddings for documents in MongoDB
 */

import { MongoClient } from 'mongodb';
import { generateBatchEmbeddings } from '../utilities/mistralEmbedding.js';
import dotenv from 'dotenv';
import logger from '../utilities/logger.js';
import { DatabaseError, EmbeddingError } from '../utilities/errorHandler.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME;
const COLLECTION_NAME = process.env.COLLECTION_NAME;

/**
 * Create embeddings for documents
 */
export async function createEmbeddings(documents, options = {}) {
  if (!Array.isArray(documents) || documents.length === 0) {
    throw new EmbeddingError('Documents array is required and must not be empty');
  }

  const {
    batchSize = parseInt(process.env.BATCH_SIZE) || 100,
    textField = 'description'
  } = options;

  const client = new MongoClient(MONGODB_URI, {
    ssl: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
  });

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    logger.info(`📊 Creating embeddings for ${documents.length} documents`);

    // Extract text to embed
    const textsToEmbed = documents.map(doc => doc[textField] || doc.title || '');

    // Generate embeddings
    const embeddingResult = await generateBatchEmbeddings(textsToEmbed, batchSize);

    logger.info(`📝 Generated ${embeddingResult.embeddings.length} embeddings`);

    // Update documents with embeddings
    let updated = 0;
    for (const embeddingData of embeddingResult.embeddings) {
      const originalDoc = documents[embeddingData.index];
      const result = await collection.updateOne(
        { id: originalDoc.id },
        {
          $set: {
            embeddings: embeddingData.embedding,
            embeddingsUpdated: new Date()
          }
        }
      );

      if (result.modifiedCount > 0) {
        updated++;
      }
    }

    logger.success(`✅ Embeddings created. Updated: ${updated}, Failed: ${embeddingResult.totalFailed}`);

    return {
      totalProcessed: embeddingResult.totalProcessed,
      totalFailed: embeddingResult.totalFailed,
      updated,
      failed: embeddingResult.failed
    };
  } catch (error) {
    logger.error('Embedding creation failed:', error.message);
    throw new EmbeddingError(`Failed to create embeddings: ${error.message}`, {
      documentsCount: documents.length,
      originalError: error.toString()
    });
  } finally {
    await client.close();
  }
}

/**
 * Validate that embeddings exist in collection
 */
export async function validateEmbeddings() {
  const client = new MongoClient(MONGODB_URI, {
    ssl: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
  });

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const count = await collection.countDocuments({ embeddings: { $exists: true } });
    const totalCount = await collection.countDocuments();

    logger.info(`📊 Embeddings validation: ${count}/${totalCount} documents have embeddings`);

    return {
      documentsWithEmbeddings: count,
      totalDocuments: totalCount,
      percentage: ((count / totalCount) * 100).toFixed(2)
    };
  } catch (error) {
    logger.error('Embeddings validation failed:', error.message);
    throw new DatabaseError(`Failed to validate embeddings: ${error.message}`);
  } finally {
    await client.close();
  }
}

export default {
  createEmbeddings,
  validateEmbeddings
};
