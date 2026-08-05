'use strict';

const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

// Fail fast on queries against fields that are not in the schema.
mongoose.set('strictQuery', true);

/**
 * Opens the shared Mongoose connection.
 * Mongoose maintains an internal connection pool, so this is called exactly
 * once during boot and reused for the lifetime of the process.
 *
 * @returns {Promise<typeof mongoose>}
 */
async function connectDatabase() {
  mongoose.connection.on('connected', () => {
    logger.info(`MongoDB connected -> ${redact(config.mongoUri)}`);
  });

  mongoose.connection.on('error', (error) => {
    logger.error('MongoDB connection error', error);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  return mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !config.isProduction,
  });
}

/**
 * Closes the Mongoose connection. Used by the graceful shutdown handler and
 * by the seed script.
 *
 * @returns {Promise<void>}
 */
async function disconnectDatabase() {
  await mongoose.connection.close();
}

/**
 * Hides credentials before a connection string reaches the logs.
 *
 * @param {string} uri
 * @returns {string}
 */
function redact(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

module.exports = { connectDatabase, disconnectDatabase };
