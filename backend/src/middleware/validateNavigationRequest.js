'use strict';

const ApiError = require('../utils/ApiError');

const MAX_NAME_LENGTH = 120;

/**
 * Validates and normalises the POST /api/navigation body before it reaches the
 * controller. Writes the cleaned values back onto `req.body`.
 *
 * @type {import('express').RequestHandler}
 */
function validateNavigationRequest(req, res, next) {
  const { start, destination } = req.body || {};

  const errors = [];
  const cleanStart = normalise(start, 'start', errors);
  const cleanDestination = normalise(destination, 'destination', errors);

  if (errors.length > 0) {
    return next(
      ApiError.badRequest('Invalid navigation request.', {
        code: 'VALIDATION_ERROR',
        details: { errors },
      })
    );
  }

  req.body.start = cleanStart;
  req.body.destination = cleanDestination;
  return next();
}

function normalise(value, field, errors) {
  if (value === undefined || value === null) {
    errors.push(`"${field}" is required.`);
    return null;
  }
  if (typeof value !== 'string') {
    errors.push(`"${field}" must be a string.`);
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    errors.push(`"${field}" must not be empty.`);
    return null;
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    errors.push(`"${field}" must be ${MAX_NAME_LENGTH} characters or fewer.`);
    return null;
  }

  return trimmed;
}

module.exports = validateNavigationRequest;
