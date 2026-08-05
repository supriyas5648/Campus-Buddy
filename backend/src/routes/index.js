'use strict';

const express = require('express');
const mongoose = require('mongoose');
const buildingRoutes = require('./buildingRoutes');
const navigationRoutes = require('./navigationRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

/** Liveness/readiness probe. */
router.get('/health', (req, res) => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    success: true,
    service: 'campusbuddy-api',
    uptimeSeconds: Math.round(process.uptime()),
    database: states[mongoose.connection.readyState] || 'unknown',
  });
});

/** Feature registry — future modules register their routers here. */
router.get('/modules', (req, res) => {
  res.status(200).json({
    success: true,
    modules: [
      { key: 'map-buddy', name: 'Map Buddy', status: 'available' },
      { key: 'faculty-info', name: 'Faculty Info', status: 'coming-soon' },
      { key: 'alumni', name: 'Alumni', status: 'coming-soon' },
      { key: 'ai-assistant', name: 'AI Assistant', status: 'coming-soon' },
    ],
  });
});

// ----- Auth module --------------------------------------------------------
router.use('/auth', authRoutes);

// ----- Map Buddy module ----------------------------------------------------
router.use('/buildings', buildingRoutes);
router.use('/navigation', navigationRoutes);

// ----- Future modules ------------------------------------------------------
// router.use('/faculty', facultyRoutes);
// router.use('/alumni',  alumniRoutes);
// router.use('/assistant', assistantRoutes);

module.exports = router;
