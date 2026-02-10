/**
 * Groq Client Utility
 * Handles LLM operations for reranking and summarization
 */

import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import logger from './logger.js';
import { SearchError } from './errorHandler.js';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const RERANK_MODEL = process.env.GROQ_RERANK_MODEL || 'llama-3.2-3b-preview';
const SUMMARIZATION_MODEL = process.env.GROQ_SUMMARIZATION_MODEL || 'llama-3.3-70b-versatile';

/**
 * Test Groq API connection
 */
export async function testConnection() {
  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hi' }],
      model: RERANK_MODEL,
      max_tokens: 10
    });
    
    logger.success('✅ Groq API connection successful!');
    return true;
  } catch (error) {
    logger.error('❌ Groq API connection failed:', error.message);
    return false;
  }
}

/**
 * Rerank documents using LLM
 * @param {string} query - User query
 * @param {Array} documents - Documents to rerank
 * @param {number} topK - Number of top documents to return
 * @returns {Promise<Object>} Reranked documents with scores
 */
export async function rerankDocuments(query, documents, topK = 5) {
  if (!query || !Array.isArray(documents) || documents.length === 0) {
    throw new SearchError('Query and non-empty documents array are required for reranking');
  }

  try {
    logger.info(`🔄 Reranking ${documents.length} documents for query: "${query}"`);

    const docList = documents
      .map((doc, idx) => `${idx + 1}. ID: ${doc.id || 'N/A'}, Title: ${doc.title || 'N/A'}\nContent: ${doc.description || doc.text || 'N/A'}`)
      .join('\n\n');

    const prompt = `Given the user query: "${query}"

Rank these documents by relevance (1=most relevant):
${docList}

Return a JSON object with this structure:
{
  "rankings": [
    {"doc_id": "...", "rank": 1, "relevance_score": 0.95, "reason": "..."},
    ...
  ]
}

Only include the top ${topK} documents.`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: RERANK_MODEL,
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new SearchError('Empty response from Groq API');
    }

    const result = JSON.parse(content);
    logger.success(`✅ Reranking complete. Top ${Math.min(topK, result.rankings.length)} results.`);
    
    return result;
  } catch (error) {
    logger.error('Reranking failed:', error.message);
    throw new SearchError(`Reranking failed: ${error.message}`);
  }
}

/**
 * Summarize results and generate answer
 * @param {string} query - User query
 * @param {Array} documents - Retrieved documents
 * @returns {Promise<Object>} Summary with sources and confidence
 */
export async function summarizeResults(query, documents) {
  if (!query || !Array.isArray(documents) || documents.length === 0) {
    throw new SearchError('Query and non-empty documents array are required for summarization');
  }

  try {
    logger.info(`📝 Summarizing ${documents.length} documents for query: "${query}"`);

    const docList = documents
      .map(doc => `Document ID: ${doc.id || 'N/A'}\nTitle: ${doc.title || 'N/A'}\nContent: ${doc.description || doc.text || 'N/A'}`)
      .join('\n---\n');

    const prompt = `Based on these documents:

${docList}

Answer this question: "${query}"

Requirements:
- Only use information from the provided documents
- If the answer is not found, explicitly state "Information not available in documents"
- Keep answer to 2-3 sentences
- Include relevant document IDs if applicable
- Be factual and cite sources`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      model: SUMMARIZATION_MODEL,
      temperature: 0.5,
      max_tokens: 300
    });

    const summary = response.choices[0]?.message?.content;
    if (!summary) {
      throw new SearchError('Empty response from Groq API');
    }

    logger.success('✅ Summarization complete');
    
    return {
      summary: summary,
      sources: documents.map(d => d.id || d.title).filter(Boolean),
      confidence: 0.85,
      processingTime: response.usage?.prompt_tokens || 0
    };
  } catch (error) {
    logger.error('Summarization failed:', error.message);
    throw new SearchError(`Summarization failed: ${error.message}`);
  }
}

export default {
  testConnection,
  rerankDocuments,
  summarizeResults
};
