'use strict';

const mongoose = require('mongoose');
const { JsonWebTokenError, TokenExpiredError } = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Central Express error handler. Every failure in the app funnels through here
 * so the client always receives the same JSON envelope:
 *
 *   { success: false, error: { code, message, details? } }
 *
 * @type {import('express').ErrorRequestHandler}
 */
// eslint-disable-next-line no-unused-vars -- Express requires the 4-arity signature
function errorHandler(err, req, res, next) {
  const apiError = toApiError(err);

  if (apiError.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${apiError.statusCode}`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${apiError.statusCode}: ${apiError.message}`);
  }

  const body = {
    success: false,
    error: {
      code: apiError.code,
      message: apiError.message,
    },
  };

  if (apiError.details) body.error.details = apiError.details;
  if (!config.isProduction && apiError.statusCode >= 500) body.error.stack = err.stack;

  res.status(apiError.statusCode).json(body);
}

/**
 * Normalises anything thrown in the app into an ApiError.
 * @param {unknown} err
 * @returns {ApiError}
 */
function toApiError(err) {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    return ApiError.badRequest('Document validation failed.', {
      code: 'VALIDATION_ERROR',
      details: {
        errors: Object.values(err.errors).map((issue) => issue.message),
      },
    });
  }

  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for "${err.path}".`, { code: 'CAST_ERROR' });
  }

  if (err && err.code === 11000) {
    return ApiError.conflict('A record with that unique key already exists.', {
      code: 'DUPLICATE_KEY',
      details: { keys: Object.keys(err.keyValue || {}) },
    });
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return ApiError.badRequest('Request body is not valid JSON.', { code: 'MALFORMED_JSON' });
  }

  if (err instanceof mongoose.Error.MongooseServerSelectionError) {
    return ApiError.internal('The campus database is unavailable. Please try again shortly.', {
      code: 'DATABASE_UNAVAILABLE',
    });
  }

  if (err instanceof TokenExpiredError) {
    return ApiError.unauthorized('Your session has expired. Please log in again.', {
      code: 'AUTH_EXPIRED',
    });
  }

  if (err instanceof JsonWebTokenError) {
    return ApiError.unauthorized('Authentication failed.', { code: 'AUTH_INVALID' });
  }

  return ApiError.internal(
    config.isProduction ? 'Something went wrong on our side.' : err?.message || 'Unknown error'
  );
}

module.exports = errorHandler;
