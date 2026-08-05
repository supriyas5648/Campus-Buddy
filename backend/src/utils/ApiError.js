'use strict';

/**
 * Operational error carrying an HTTP status code and an optional machine
 * readable code. Anything thrown that is *not* an ApiError is treated as an
 * unexpected bug by the error handler and reported as a 500.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message Human readable message (safe to show to the user)
   * @param {object} [options]
   * @param {string} [options.code] Stable machine readable code
   * @param {object} [options.details] Extra context returned to the client
   */
  constructor(statusCode, message, { code, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code || defaultCodeFor(statusCode);
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, options) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', ...options });
  }

  static notFound(message, options) {
    return new ApiError(404, message, { code: 'NOT_FOUND', ...options });
  }

  static conflict(message, options) {
    return new ApiError(409, message, { code: 'CONFLICT', ...options });
  }

  static unauthorized(message, options) {
    return new ApiError(401, message, { code: 'UNAUTHORIZED', ...options });
  }

  static forbidden(message, options) {
    return new ApiError(403, message, { code: 'FORBIDDEN', ...options });
  }

  static internal(message, options) {
    return new ApiError(500, message, { code: 'INTERNAL_ERROR', ...options });
  }
}

function defaultCodeFor(statusCode) {
  if (statusCode >= 500) return 'INTERNAL_ERROR';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 401) return 'UNAUTHORIZED';
  if (statusCode === 403) return 'FORBIDDEN';
  return 'BAD_REQUEST';
}

module.exports = ApiError;
