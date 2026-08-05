'use strict';

/**
 * Tiny leveled logger. Keeps a single choke point for application logging so
 * it can later be swapped for winston/pino without touching call sites.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const activeLevel = process.env.NODE_ENV === 'production' ? LEVELS.info : LEVELS.debug;

function stamp() {
  return new Date().toISOString();
}

function write(level, consoleMethod, args) {
  if (LEVELS[level] > activeLevel) return;
  // eslint-disable-next-line no-console
  console[consoleMethod](`[${stamp()}] [${level.toUpperCase()}]`, ...args);
}

module.exports = {
  error: (...args) => write('error', 'error', args),
  warn: (...args) => write('warn', 'warn', args),
  info: (...args) => write('info', 'log', args),
  debug: (...args) => write('debug', 'log', args),
};
