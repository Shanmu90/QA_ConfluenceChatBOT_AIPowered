/**
 * QA Domain Dictionaries
 * Contains QA-specific abbreviations and synonyms
 */

export const abbreviations = {
  // Testing Types
  'tc': 'test case',
  'ts': 'test scenario',
  'tp': 'test plan',
  'uat': 'user acceptance testing',
  'sit': 'system integration testing',
  'e2e': 'end to end',
  'api': 'application programming interface',
  'ui': 'user interface',
  'db': 'database',
  'qa': 'quality assurance',
  'qc': 'quality control',

  // Defect Related
  'rca': 'root cause analysis',
  'bug': 'defect',
  'rtm': 'requirements traceability matrix',
  'sr': 'service request',
  'cr': 'change request',
  'pr': 'pull request',

  // Process Related
  'bdd': 'behavior driven development',
  'tdd': 'test driven development',
  'dod': 'definition of done',
  'dor': 'definition of ready',
  'sla': 'service level agreement',

  // Common Testing
  'regression': 'regression testing',
  'smoke': 'smoke testing',
  'sanity': 'sanity testing',
  'negative': 'negative testing',
  'positive': 'positive testing',
  'boundary': 'boundary value testing'
};

export const synonyms = {
  // Test Case Related
  'test case': ['test scenario', 'test script', 'test execution', 'test specification'],
  'test scenario': ['test case', 'test flow', 'test path'],
  'negative': ['invalid', 'error', 'failure', 'exception'],
  'positive': ['valid', 'success', 'pass'],
  'timeout': ['delay', 'hang', 'slow', 'stuck', 'unresponsive'],
  'payment': ['transaction', 'billing', 'charge', 'invoice', 'checkout'],
  
  // Test Execution
  'pass': ['success', 'valid', 'working'],
  'fail': ['error', 'issue', 'problem', 'defect'],
  'verify': ['validate', 'confirm', 'check', 'assert'],
  'login': ['authentication', 'sign in', 'authorize'],
  'logout': ['sign out', 'disconnect'],

  // Search Related
  'find': ['search', 'locate', 'get', 'retrieve', 'query'],
  'test': ['check', 'validate', 'verify', 'confirm'],
  'create': ['add', 'new', 'insert', 'initialize'],
  'update': ['edit', 'modify', 'change'],
  'delete': ['remove', 'drop', 'purge'],

  // Status Related
  'active': ['enabled', 'running', 'online', 'working'],
  'inactive': ['disabled', 'offline', 'stopped'],
  'pending': ['waiting', 'in progress', 'processing'],
  'completed': ['done', 'finished', 'successful']
};

export const testCaseIdPatterns = [
  /TC-\d+/gi,           // TC-001, TC-1234
  /TEST-\d+/gi,         // TEST-001, TEST-1234
  /US-\d+/gi,           // US-001 (User Story)
  /BUG-\d+/gi,          // BUG-001
  /[A-Z]+-\d+/gi        // Generic PROJECT-ID format
];

export default {
  abbreviations,
  synonyms,
  testCaseIdPatterns
};
