/**
 * Query Normalizer
 * Handles lowercase conversion, special character handling, and ID extraction
 */

import { testCaseIdPatterns } from './dictionaries.js';
import logger from '../utilities/logger.js';

/**
 * Normalize query text
 */
export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\-]/g, ' ')  // Remove special chars except hyphen
    .replace(/\s+/g, ' ')         // Normalize whitespace
    .trim();
}

/**
 * Extract test case IDs from query
 */
export function extractTestCaseIds(text) {
  const ids = new Set();
  
  testCaseIdPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => ids.add(match.toUpperCase()));
    }
  });

  return Array.from(ids);
}

/**
 * Main normalization pipeline
 */
export function normalizeComplete(query) {
  const startTime = Date.now();

  try {
    const original = query;
    const normalized = normalizeText(query);
    const extractedIds = extractTestCaseIds(query);

    const result = {
      original,
      normalized,
      extractedIds,
      metadata: {
        processingTime: Date.now() - startTime,
        originalLength: original.length,
        normalizedLength: normalized.length,
        idsExtracted: extractedIds.length
      }
    };

    logger.debug('Normalization complete', result);
    return result;
  } catch (error) {
    logger.error('Normalization failed:', error.message);
    return {
      original: query,
      normalized: query.toLowerCase(),
      extractedIds: [],
      metadata: { error: error.message }
    };
  }
}

export default {
  normalizeText,
  extractTestCaseIds,
  normalizeComplete
};
