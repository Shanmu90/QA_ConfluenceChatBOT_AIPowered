/**
 * Logger Utility
 * Provides structured logging with different severity levels
 */

const LogLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SUCCESS: 'SUCCESS'
};

function formatTimestamp() {
  return new Date().toISOString();
}

function formatLog(level, message, data = null) {
  const timestamp = formatTimestamp();
  const baseMessage = `[${timestamp}] [${level}] ${message}`;
  return data ? `${baseMessage}\n${JSON.stringify(data, null, 2)}` : baseMessage;
}

const colors = {
  ERROR: '\x1b[31m',      // Red
  WARN: '\x1b[33m',       // Yellow
  INFO: '\x1b[36m',       // Cyan
  DEBUG: '\x1b[35m',      // Magenta
  SUCCESS: '\x1b[32m',    // Green
  RESET: '\x1b[0m'        // Reset
};

const logger = {
  error: (message, data) => {
    const formatted = formatLog(LogLevels.ERROR, message, data);
    console.error(`${colors.ERROR}${formatted}${colors.RESET}`);
  },
  warn: (message, data) => {
    const formatted = formatLog(LogLevels.WARN, message, data);
    console.warn(`${colors.WARN}${formatted}${colors.RESET}`);
  },
  info: (message, data) => {
    const formatted = formatLog(LogLevels.INFO, message, data);
    console.log(`${colors.INFO}${formatted}${colors.RESET}`);
  },
  debug: (message, data) => {
    if (process.env.DEBUG) {
      const formatted = formatLog(LogLevels.DEBUG, message, data);
      console.log(`${colors.DEBUG}${formatted}${colors.RESET}`);
    }
  },
  success: (message, data) => {
    const formatted = formatLog(LogLevels.SUCCESS, message, data);
    console.log(`${colors.SUCCESS}${formatted}${colors.RESET}`);
  }
};

export default logger;
