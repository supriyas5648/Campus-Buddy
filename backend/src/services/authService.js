'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

async function registerUser(input = {}) {
  const { username, email, password, role } = input;

  if (!username || !email || !password) {
    throw ApiError.badRequest('Username, email and password are required.', {
      code: 'AUTH_VALIDATION_ERROR',
    });
  }

  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role === 'admin' ? 'admin' : 'student';

  const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username: normalizedUsername }] });
  if (existingUser) {
    throw ApiError.conflict('A user with that email or username already exists.', {
      code: 'USER_EXISTS',
    });
  }

  const isFirstUser = (await User.countDocuments()) === 0;
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role: isFirstUser ? 'admin' : normalizedRole,
  });

  return buildAuthPayload(user);
}

async function loginUser(input = {}) {
  const { email, password } = input;

  if (!email || !password) {
    throw ApiError.badRequest('Email and password are required.', {
      code: 'AUTH_VALIDATION_ERROR',
    });
  }

  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password.', {
      code: 'INVALID_CREDENTIALS',
    });
  }

  const validPassword = await bcrypt.compare(String(password), user.password);
  if (!validPassword) {
    throw ApiError.unauthorized('Invalid email or password.', {
      code: 'INVALID_CREDENTIALS',
    });
  }

  return buildAuthPayload(user);
}

async function getUserById(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw ApiError.notFound('User not found.', { code: 'USER_NOT_FOUND' });
  }
  return user;
}

async function ensureDefaultAdmin() {
  const count = await User.countDocuments();
  if (count > 0) return null;

  const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
  const user = await User.create({
    username: 'admin',
    email: 'admin@campusbuddy.dev',
    password: await bcrypt.hash(defaultPassword, 12),
    role: 'admin',
  });

  return user;
}

function buildAuthPayload(user) {
  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role, username: user.username },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  return {
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = { registerUser, loginUser, getUserById, ensureDefaultAdmin };
