'use strict';

const ApiError = require('../utils/ApiError');

function authorizeAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required.', { code: 'FORBIDDEN' }));
  }

  return next();
}

module.exports = authorizeAdmin;
