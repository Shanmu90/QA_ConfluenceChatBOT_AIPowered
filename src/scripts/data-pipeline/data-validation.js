/**
 * Data Validation
 * Validates document structure and completeness
 */

import logger from '../utilities/logger.js';
import { ValidationError } from '../utilities/errorHandler.js';

const REQUIRED_FIELDS = ['id', 'title'];
const RECOMMENDED_FIELDS = ['description', 'module', 'steps', 'expectedResults'];

/**
 * Validate single document
 */
export function validateDocument(doc) {
  const errors = [];
  const warnings = [];

  // Check required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!doc[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Check recommended fields
  RECOMMENDED_FIELDS.forEach(field => {
    if (!doc[field]) {
      warnings.push(`Missing recommended field: ${field}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate collection of documents
 */
export function validateDocuments(documents) {
  if (!Array.isArray(documents)) {
    throw new ValidationError('Documents must be an array');
  }

  logger.info(`🔍 Validating ${documents.length} documents...`);

  const results = {
    total: documents.length,
    valid: 0,
    invalid: 0,
    warnings: 0,
    details: []
  };

  documents.forEach((doc, index) => {
    const validation = validateDocument(doc);
    
    if (validation.valid) {
      results.valid++;
    } else {
      results.invalid++;
    }

    if (validation.warnings.length > 0) {
      results.warnings++;
    }

    if (!validation.valid || validation.warnings.length > 0) {
      results.details.push({
        index,
        id: doc.id,
        ...validation
      });
    }
  });

  logger.success(`✅ Validation complete: Valid=${results.valid}, Invalid=${results.invalid}, Warnings=${results.warnings}`);

  return results;
}

/**
 * Sanitize document for storage
 */
export function sanitizeDocument(doc) {
  return {
    id: String(doc.id || '').trim(),
    title: String(doc.title || '').trim(),
    description: String(doc.description || '').trim(),
    module: String(doc.module || '').trim(),
    steps: Array.isArray(doc.steps) ? doc.steps : [],
    expectedResults: Array.isArray(doc.expectedResults) ? doc.expectedResults : [],
    preRequisites: Array.isArray(doc.preRequisites) ? doc.preRequisites : [],
    labels: Array.isArray(doc.labels) ? doc.labels : [],
    source_url: String(doc.source_url || '').trim(),
    created: doc.created || new Date(),
    updated: doc.updated || new Date()
  };
}

export default {
  validateDocument,
  validateDocuments,
  sanitizeDocument,
  REQUIRED_FIELDS,
  RECOMMENDED_FIELDS
};
