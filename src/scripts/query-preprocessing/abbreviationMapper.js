/**
 * Abbreviation Mapper
 * Expands QA-specific abbreviations in queries
 */

import { abbreviations } from './dictionaries.js';
import logger from '../utilities/logger.js';

/**
 * Expand abbreviations in text
 */
export function expandAbbreviations(text, customAbbreviations = {}) {
  if (!text || typeof text !== 'string') return text;

  const combined = { ...abbreviations, ...customAbbreviations };
  let expanded = text.toLowerCase();
  const replacements = [];

  Object.entries(combined).forEach(([abbr, full]) => {
    const pattern = new RegExp(`\\b${abbr}\\b`, 'gi');
    if (pattern.test(expanded)) {
      replacements.push({ from: abbr, to: full });
      expanded = expanded.replace(pattern, full);
    }
  });

  return {
    expanded,
    replacements
  };
}

/**
 * Smart expansion with context awareness
 */
export function smartExpand(text, customAbbreviations = {}) {
  const result = expandAbbreviations(text, customAbbreviations);
  
  return {
    ...result,
    allVariations: [text, result.expanded]
  };
}

/**
 * Main abbreviation expansion pipeline
 */
export function expandComplete(query, customAbbreviations = {}) {
  const startTime = Date.now();

  try {
    const { expanded, replacements } = expandAbbreviations(query, customAbbreviations);
    const { allVariations } = smartExpand(expanded, customAbbreviations);

    const result = {
      original: query,
      expanded,
      replacements,
      allVariations,
      metadata: {
        processingTime: Date.now() - startTime,
        replacementsCount: replacements.length
      }
    };

    logger.debug('Abbreviation expansion complete', { replacements });
    return result;
  } catch (error) {
    logger.error('Abbreviation expansion failed:', error.message);
    return {
      original: query,
      expanded: query,
      replacements: [],
      allVariations: [query],
      metadata: { error: error.message }
    };
  }
}

export default {
  expandAbbreviations,
  smartExpand,
  expandComplete
};
