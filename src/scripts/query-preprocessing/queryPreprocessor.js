/**
 * Query Preprocessor - Main Pipeline Orchestrator
 * Combines normalization, abbreviation expansion, and synonym expansion
 */

import { normalizeComplete } from './normalizer.js';
import { expandComplete as expandAbbreviations } from './abbreviationMapper.js';
import { expandComplete as expandSynonyms } from './synonymExpander.js';
import logger from '../utilities/logger.js';

/**
 * Main query preprocessing pipeline
 */
export function preprocessQuery(rawQuery, options = {}) {
  const startTime = Date.now();

  try {
    const {
      enableAbbreviations = true,
      enableSynonyms = true,
      maxSynonymVariations = 5,
      customAbbreviations = {},
      customSynonyms = {},
      preserveOriginal = true
    } = options;

    // Validate input
    if (!rawQuery || typeof rawQuery !== 'string') {
      throw new Error('Query must be a non-empty string');
    }

    logger.info(`📝 Preprocessing query: "${rawQuery}"`);

    // Step 1: Normalization
    const normalResult = normalizeComplete(rawQuery);
    const normalized = normalResult.normalized;

    // Step 2: Abbreviation Expansion
    let expanded = normalized;
    let abbrevResult = null;
    if (enableAbbreviations) {
      abbrevResult = expandAbbreviations(normalized, customAbbreviations);
      expanded = abbrevResult.expanded;
    }

    // Step 3: Synonym Expansion
    let synonymVariations = [expanded];
    let synonymResult = null;
    if (enableSynonyms) {
      synonymResult = expandSynonyms(expanded, customSynonyms, maxSynonymVariations);
      synonymVariations = synonymResult.variations;
    }

    // Build response
    const result = {
      original: preserveOriginal ? rawQuery : undefined,
      normalized,
      abbreviationExpanded: abbrevResult?.expanded || normalized,
      synonymExpanded: synonymVariations,
      
      // Additional details
      extractedTestCaseIds: normalResult.extractedIds,
      abbreviationReplacements: abbrevResult?.replacements || [],
      
      // Metadata
      metadata: {
        processingTime: Date.now() - startTime,
        originalLength: rawQuery.length,
        normalizedLength: normalized.length,
        abbreviationsExpanded: abbrevResult?.replacements.length || 0,
        synonymVariationsGenerated: synonymVariations.length,
        extractedIds: normalResult.extractedIds.length
      }
    };

    logger.success('✅ Query preprocessing complete', {
      processingTime: result.metadata.processingTime,
      variations: synonymVariations.length
    });

    return result;
  } catch (error) {
    logger.error('Query preprocessing failed:', error.message);
    return {
      original: rawQuery,
      normalized: rawQuery.toLowerCase(),
      abbreviationExpanded: rawQuery.toLowerCase(),
      synonymExpanded: [rawQuery.toLowerCase()],
      extractedTestCaseIds: [],
      abbreviationReplacements: [],
      metadata: {
        error: error.message,
        processingTime: Date.now() - startTime
      }
    };
  }
}

export default {
  preprocessQuery
};
