/**
 * Test Search Functions
 * Run with: node src/scripts/search/test-search.js
 */

import { quickSearch } from '../rag-pipeline.js';
import logger from '../utilities/logger.js';

const testQueries = [
  'payment timeout test cases',
  'authentication flow validation',
  'database connection error handling'
];

async function runSearchTests() {
  logger.info('🔍 Starting Search Tests\n');

  for (const query of testQueries) {
    try {
      logger.info(`\nSearching: "${query}"`);
      logger.info('─'.repeat(60));

      // Try hybrid search
      const result = await quickSearch(query, 'hybrid');

      logger.info(`Results: ${result.count}`);
      
      result.results.slice(0, 3).forEach((doc, idx) => {
        logger.info(`\n${idx + 1}. ${doc.title || doc.id}`);
        logger.info(`   Score: ${(doc.fusedScore || doc.score).toFixed(4)}`);
      });

    } catch (error) {
      logger.warn(`Search failed for query: ${error.message}`);
    }
  }

  logger.success('\n✅ Search tests completed!');
}

runSearchTests().catch(error => {
  logger.error('Test failed:', error.message);
  process.exit(1);
});
