'use strict';

const jwt = require('jsonwebtoken');
const asyncHandler = require('./asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const config = require('../config/env');

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    throw ApiError.unauthorized('Authentication required.', { code: 'AUTH_REQUIRED' });
  }

  const payload = jwt.verify(token, config.jwtSecret);
  if (!payload?.sub) {
    throw ApiError.unauthorized('Authentication failed.', { code: 'AUTH_INVALID' });
  }

  const user = await User.findById(payload.sub).select('-password');
  if (!user) {
    throw ApiError.unauthorized('Authentication failed.', { code: 'AUTH_INVALID' });
  }

  req.user = user;
  next();
});

module.exports = authenticate;
