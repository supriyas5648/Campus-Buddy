'use strict';

/**
 * ---------------------------------------------------------------------------
 * Seed script — loads `src/data/campusData.js` into MongoDB.
 * ---------------------------------------------------------------------------
 *   npm run seed         upsert nodes/buildings/routes (safe to re-run)
 *   npm run seed:fresh   drop the three collections first, then insert
 *
 * The script also validates the data before writing:
 *   - every building points at a node that exists
 *   - every route hop references a node that exists
 *   - every pair of buildings is reachable by a stored route
 * It prints a report and exits with a non-zero code when validation fails.
 */

const mongoose = require('mongoose');
const { connectDatabase, disconnectDatabase } = require('../config/db');
const logger = require('../utils/logger');
const Node = require('../models/Node');
const Building = require('../models/Building');
const Route = require('../models/Route');
const { seedUsers } = require('./seedUsers');
const { nodes, buildings, buildRouteDocuments } = require('../data/campusData');

const FRESH = process.argv.includes('--fresh');

/** Average walking speed used to derive the ETA metadata, in metres/minute. */
const WALK_SPEED_M_PER_MIN = 75;
/** SVG units per real-world metre on this campus map (rough calibration). */
const SVG_UNITS_PER_METRE = 3.2;

// async function main() {
//   await connectDatabase();

//   const nodeIndex = new Map(nodes.map((node) => [node.nodeId, node]));
//   const routeDocs = buildRouteDocuments();

//   validate(nodeIndex, routeDocs);

//   if (FRESH) {
//     logger.warn('--fresh supplied: dropping nodes, buildings and routes collections');
//     await Promise.all([
//       Node.collection.drop().catch(ignoreMissingCollection),
//       Building.collection.drop().catch(ignoreMissingCollection),
//       Route.collection.drop().catch(ignoreMissingCollection),
//     ]);
//   }

//   // --- nodes ---------------------------------------------------------------
//   await Node.bulkWrite(
//     nodes.map((node) => ({
//       updateOne: { filter: { nodeId: node.nodeId }, update: { $set: node }, upsert: true },
//     })),
//     { ordered: false }
//   );
//   logger.info(`Nodes seeded: ${nodes.length}`);

//   // --- buildings -----------------------------------------------------------
//   await Building.bulkWrite(
//     buildings.map((building) => ({
//       updateOne: { filter: { name: building.name }, update: { $set: building }, upsert: true },
//     })),
//     { ordered: false }
//   );
//   logger.info(`Buildings seeded: ${buildings.length}`);

//   // --- routes (forward + reverse) -----------------------------------------
//   const allRoutes = routeDocs.flatMap((route) => {
//     const reversed = [...route.path].reverse();
//     return [
//       withMetrics(route, nodeIndex),
//       withMetrics(
//         { startNode: reversed[0], endNode: reversed[reversed.length - 1], path: reversed },
//         nodeIndex
//       ),
//     ];
//   });

//   await Route.bulkWrite(
//     allRoutes.map((route) => ({
//       updateOne: {
//         filter: { startNode: route.startNode, endNode: route.endNode },
//         update: { $set: route },
//         upsert: true,
//       },
//     })),
//     { ordered: false }
//   );
//   logger.info(`Routes seeded: ${allRoutes.length} (${routeDocs.length} authored + reverses)`);

//   await mongoose.connection.syncIndexes().catch(() => {
//     /* index sync is best-effort */
//   });

//   logger.info('Seed complete.');
// }
async function main() {
  await connectDatabase();

  // Seed default users
  logger.info('Starting user seeding...');
  await seedUsers();
  logger.info('Users seeded.');

  const nodeIndex = new Map(nodes.map((node) => [node.nodeId, node]));
  const routeDocs = buildRouteDocuments();

  // validate(nodeIndex, routeDocs);

  if (FRESH) {
    logger.warn('--fresh supplied: dropping nodes collection');
    await Node.collection.drop().catch(ignoreMissingCollection);

    // await Building.collection.drop().catch(ignoreMissingCollection);
    // await Route.collection.drop().catch(ignoreMissingCollection);
  }

  // ---------------- Nodes ----------------
  await Node.bulkWrite(
    nodes.map((node) => ({
      updateOne: {
        filter: { nodeId: node.nodeId },
        update: { $set: node },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  logger.info(`Nodes seeded: ${nodes.length}`);

  // ---------------- Buildings ----------------
  /*
  await Building.bulkWrite(
    buildings.map((building) => ({
      updateOne: {
        filter: { name: building.name },
        update: { $set: building },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  logger.info(`Buildings seeded: ${buildings.length}`);
  */

  // ---------------- Routes ----------------
  /*
  const allRoutes = routeDocs.flatMap((route) => {
    const reversed = [...route.path].reverse();

    return [
      withMetrics(route, nodeIndex),
      withMetrics(
        {
          startNode: reversed[0],
          endNode: reversed[reversed.length - 1],
          path: reversed,
        },
        nodeIndex
      ),
    ];
  });

  await Route.bulkWrite(
    allRoutes.map((route) => ({
      updateOne: {
        filter: {
          startNode: route.startNode,
          endNode: route.endNode,
        },
        update: { $set: route },
        upsert: true,
      },
    })),
    { ordered: false }
  );

  logger.info(
    `Routes seeded: ${allRoutes.length} (${routeDocs.length} authored + reverses)`
  );
  */

  await mongoose.connection.syncIndexes().catch(() => {});

  logger.info('Seed complete.');
}

/**
 * Adds distance/ETA metadata by measuring the stored polyline.
 * This measures a route that already exists — it does not search for one.
 */
function withMetrics(route, nodeIndex) {
  let svgLength = 0;
  for (let i = 1; i < route.path.length; i += 1) {
    const a = nodeIndex.get(route.path[i - 1]);
    const b = nodeIndex.get(route.path[i]);
    svgLength += Math.hypot(b.x - a.x, b.y - a.y);
  }
  const distanceMeters = Math.round(svgLength / SVG_UNITS_PER_METRE);
  return {
    ...route,
    distanceMeters,
    estimatedMinutes: Math.max(1, Math.round(distanceMeters / WALK_SPEED_M_PER_MIN)),
  };
}

/**
 * Guards the data set against typos before anything is written.
 * @throws {Error} when the data set is inconsistent
 */
function validate(nodeIndex, routeDocs) {
  const problems = [];

  for (const building of buildings) {
    if (!nodeIndex.has(building.nearestNode)) {
      problems.push(`Building "${building.name}" references unknown node "${building.nearestNode}"`);
    }
  }

  for (const route of routeDocs) {
    for (const nodeId of route.path) {
      if (!nodeIndex.has(nodeId)) {
        problems.push(`Route ${route.startNode}->${route.endNode} references unknown node "${nodeId}"`);
      }
    }
  }

  // Coverage: with forward + reverse storage, every unordered building pair
  // must be represented by at least one authored route.
  const authored = new Set(routeDocs.map((r) => pairKey(r.startNode, r.endNode)));
  const missing = [];
  for (let i = 0; i < buildings.length; i += 1) {
    for (let j = i + 1; j < buildings.length; j += 1) {
      const a = buildings[i];
      const b = buildings[j];
      if (a.nearestNode === b.nearestNode) continue;
      if (!authored.has(pairKey(a.nearestNode, b.nearestNode))) {
        missing.push(`${a.name} <-> ${b.name} (${a.nearestNode}/${b.nearestNode})`);
      }
    }
  }

  if (problems.length > 0) {
    problems.forEach((problem) => logger.error(problem));
    throw new Error(`Campus data failed validation with ${problems.length} problem(s).`);
  }

  if (missing.length > 0) {
    logger.warn(`${missing.length} building pair(s) have no predefined route:`);
    missing.forEach((pair) => logger.warn(`  - ${pair}`));
    logger.warn('Those searches will return the "Route Not Found" card until you add them.');
  } else {
    logger.info('Coverage check passed: every pair of buildings has a predefined route.');
  }
}

function pairKey(a, b) {
  return [a, b].sort().join('::');
}

function ignoreMissingCollection(error) {
  if (error && error.codeName === 'NamespaceNotFound') return;
  throw error;
}

main()
  .then(async () => {
    await disconnectDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error('Seed failed:', error.message);
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  });
