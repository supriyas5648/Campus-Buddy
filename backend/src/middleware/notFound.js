'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Terminal 404 handler for unmatched API routes.
 * @type {import('express').RequestHandler}
 */
function notFound(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} does not exist.`, {
    code: 'ENDPOINT_NOT_FOUND',
  }));
}

module.exports = notFound;
