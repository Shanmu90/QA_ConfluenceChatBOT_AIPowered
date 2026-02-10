/**
 * Error Handler Utility
 * Provides custom error classes and error handling utilities
 */

export class RAGError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500, details = null) {
    super(message);
    this.name = 'RAGError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        timestamp: this.timestamp,
        details: this.details
      }
    };
  }
}

export class DatabaseError extends RAGError {
  constructor(message, details = null) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

export class APIError extends RAGError {
  constructor(message, statusCode = 400, details = null) {
    super(message, 'API_ERROR', statusCode, details);
    this.name = 'APIError';
  }
}

export class EmbeddingError extends RAGError {
  constructor(message, details = null) {
    super(message, 'EMBEDDING_ERROR', 503, details);
    this.name = 'EmbeddingError';
  }
}

export class SearchError extends RAGError {
  constructor(message, details = null) {
    super(message, 'SEARCH_ERROR', 503, details);
    this.name = 'SearchError';
  }
}

export class ValidationError extends RAGError {
  constructor(message, details = null) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export function handleError(error, context = '') {
  if (error instanceof RAGError) {
    return error;
  }
  
  if (error.message.includes('MongoDB')) {
    return new DatabaseError(error.message, { originalError: error.toString(), context });
  }
  
  if (error.message.includes('API') || error.response?.status) {
    return new APIError(error.message, error.response?.status || 500, { context });
  }
  
  return new RAGError(error.message, 'UNKNOWN_ERROR', 500, { context, originalError: error.toString() });
}
