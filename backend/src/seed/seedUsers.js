'use strict';

const bcrypt = require('bcrypt');
const User = require('../models/User');

async function seedUsers() {
  const existing = await User.countDocuments();
  if (existing > 0) return;

  const hashedPassword = await bcrypt.hash('Student123!', 12);
  await User.create({
    username: 'student',
    email: 'student@campusbuddy.dev',
    password: hashedPassword,
    role: 'student',
  });

  const adminPassword = await bcrypt.hash('Admin123!', 12);
  await User.create({
    username: 'admin',
    email: 'admin@campusbuddy.dev',
    password: adminPassword,
    role: 'admin',
  });
}

module.exports = { seedUsers };
