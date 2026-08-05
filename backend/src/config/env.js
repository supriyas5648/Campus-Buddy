'use strict';

const path = require('path');
const dotenv = require('dotenv');

// Load `.env` from the backend root regardless of the current working directory.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Reads an environment variable, falling back to a default.
 * Throws when a variable is required but missing, so the process fails fast
 * at boot instead of at the first database query.
 *
 * @param {string} key
 * @param {{ required?: boolean, fallback?: string }} [options]
 * @returns {string}
 */
function read(key, { required = false, fallback } = {}) {
  const value = process.env[key];

  if (value === undefined || value === '') {
    if (required) {
      throw new Error(
        `Missing required environment variable "${key}". ` +
          'Copy backend/.env.example to backend/.env and fill it in.'
      );
    }
    return fallback;
  }

  return value;
}

const nodeEnv = read('NODE_ENV', { fallback: 'development' });

const config = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number.parseInt(read('PORT', { fallback: '5000' }), 10),
  mongoUri: read('MONGO_URI', {
    fallback: 'mongodb://127.0.0.1:27017/campusbuddy',
  }),
  corsOrigins: read('CORS_ORIGIN', {
    fallback: 'http://localhost:5173,http://127.0.0.1:5173',
  })
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: read('JWT_SECRET', { fallback: 'campusbuddy-dev-secret' }),
  jwtExpiresIn: read('JWT_EXPIRES_IN', { fallback: '7d' }),
});

module.exports = config;
