/**
 * Synonym Expander
 * Expands query with semantically similar terms
 */

import { synonyms } from './dictionaries.js';
import logger from '../utilities/logger.js';

/**
 * Expand synonyms in text
 */
export function expandSynonyms(text, customSynonyms = {}) {
  if (!text || typeof text !== 'string') return [];

  const combined = { ...synonyms, ...customSynonyms };
  const variations = new Set([text]);

  const words = text.toLowerCase().split(/\s+/);

  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (combined[cleanWord]) {
      combined[cleanWord].forEach(synonym => {
        const variation = text.replace(
          new RegExp(`\\b${cleanWord}\\b`, 'gi'),
          synonym
        );
        variations.add(variation);
      });
    }
  });

  return Array.from(variations);
}

/**
 * Generate multiple synonym variations
 */
export function expandComplete(query, customSynonyms = {}, maxVariations = 5) {
  const startTime = Date.now();

  try {
    const allVariations = expandSynonyms(query, customSynonyms);
    const limitedVariations = allVariations.slice(0, maxVariations);

    const result = {
      original: query,
      variations: limitedVariations,
      metadata: {
        processingTime: Date.now() - startTime,
        totalVariations: allVariations.length,
        returnedVariations: limitedVariations.length
      }
    };

    logger.debug('Synonym expansion complete', { 
      variationsGenerated: limitedVariations.length 
    });
    return result;
  } catch (error) {
    logger.error('Synonym expansion failed:', error.message);
    return {
      original: query,
      variations: [query],
      metadata: { error: error.message }
    };
  }
}

export default {
  expandSynonyms,
  expandComplete
};
