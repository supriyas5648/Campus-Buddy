'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const apiRoutes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

/**
 * Builds the Express application. Kept separate from `server.js` so the app can
 * be imported by tests without opening a port.
 *
 * @returns {import('express').Express}
 */
function createApp() {
  const app = express();

  // Behind a reverse proxy (Render/Nginx) so rate limiting sees real client IPs.
  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin/non-browser callers (curl, Postman) which send no Origin.
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`Origin "${origin}" is not allowed by CORS.`));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
    })
  );
  app.use(express.json({ limit: '32kb' }));
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));

  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 120,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down.' },
      },
    })
  );

  app.get('/', (req, res) => {
    res.json({
      success: true,
      name: 'CampusBuddy API',
      version: '1.0.0',
      docs: {
        buildings: 'GET /api/buildings',
        buildingDetails: 'GET /api/buildings/details',
        navigation: 'POST /api/navigation { start, destination }',
        nodes: 'GET /api/navigation/nodes',
        health: 'GET /api/health',
      },
    });
  });

  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
