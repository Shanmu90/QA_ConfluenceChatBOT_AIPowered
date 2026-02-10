/**
 * Test Query Preprocessing
 * Run with: node src/scripts/query-preprocessing/test-preprocessing.js
 */

import { preprocessQuery } from './queryPreprocessor.js';
import logger from '../utilities/logger.js';

const testQueries = [
  'What are the negative test cases for payment timeout?',
  'TC-501 and TC-502 for authentication flow',
  'Find UAT scenarios for user login',
  'RCA for defect BUG-123 related to database connection',
  'Show all regression tests for API module'
];

async function runTests() {
  logger.info('🧪 Starting Query Preprocessing Tests\n');

  testQueries.forEach((query, index) => {
    logger.info(`\n Test ${index + 1}: "${query}"`);
    logger.info('─'.repeat(60));

    const result = preprocessQuery(query);

    logger.info('Normalized:', result.normalized);
    logger.info('Abbreviations Expanded:', result.abbreviationExpanded);
    logger.info('Synonym Variations:', result.synonymExpanded.length);
    
    if (result.extractedTestCaseIds.length > 0) {
      logger.info('Extracted IDs:', result.extractedTestCaseIds.join(', '));
    }

    logger.info(`Processing Time: ${result.metadata.processingTime}ms`);
  });

  logger.success('\n✅ All preprocessing tests completed!');
}

runTests().catch(error => {
  logger.error('Test failed:', error.message);
  process.exit(1);
});
