'use strict';

const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const { connectDatabase, disconnectDatabase } = require('./src/config/db');
const createApp = require('./src/app');
const { ensureDefaultAdmin } = require('./src/services/authService');

async function bootstrap() {
  await connectDatabase();
  await ensureDefaultAdmin();

  const app = createApp();
  const server = app.listen(config.port, () => {
    logger.info(`CampusBuddy API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  registerShutdownHandlers(server);
}

/**
 * Drains in-flight requests and closes the database connection before exiting.
 * @param {import('http').Server} server
 */
function registerShutdownHandlers(server) {
  let shuttingDown = false;

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info(`${signal} received — shutting down gracefully...`);

    server.close(async () => {
      await disconnectDatabase().catch(() => {});
      logger.info('Shutdown complete.');
      process.exit(0);
    });

    // Hard stop if connections refuse to drain.
    setTimeout(() => {
      logger.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => process.on(signal, () => shutdown(signal)));

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection:', reason);
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    process.exit(1);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start CampusBuddy API:', error.message);
  process.exit(1);
});
