'use strict';

const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const payload = await authService.registerUser(req.body);
  res.status(201).json({ success: true, ...payload });
});

const login = asyncHandler(async (req, res) => {
  const payload = await authService.loginUser(req.body);
  res.status(200).json({ success: true, ...payload });
});

const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = { register, login, getMe };
