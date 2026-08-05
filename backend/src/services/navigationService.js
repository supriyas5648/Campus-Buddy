'use strict';

const Node = require('../models/Node');
const Route = require('../models/Route');
const ApiError = require('../utils/ApiError');
const { findBuildingByName } = require('./buildingService');

/**
 * ---------------------------------------------------------------------------
 * Navigation service
 * ---------------------------------------------------------------------------
 * Resolves a (start, destination) pair of building names into a list of map
 * coordinates by performing three straightforward database lookups.
 *
 * There is deliberately NO path finding here — no A*, Dijkstra, BFS or DFS.
 * Routes are authored by hand and stored in the `routes` collection; this
 * service only retrieves the stored one.
 *
 *   STEP 1  buildings  -> nearestNode for start and destination
 *   STEP 2  routes     -> findOne({ startNode, endNode }) -> ["N1","N2",...]
 *   STEP 3  nodes      -> coordinates for each id in that path
 *   STEP 4  assemble the response
 */

/**
 * @param {string} startName
 * @param {string} destinationName
 * @returns {Promise<{start: string, destination: string, path: Array<{id: string, x: number, y: number}>, distanceMeters: number|null, estimatedMinutes: number|null}>}
 */
async function getNavigationRoute(startName, destinationName) {
  // ----- STEP 1: buildings -> nodes ---------------------------------------
  const [startBuilding, destinationBuilding] = await Promise.all([
    findBuildingByName(startName, 'start'),
    findBuildingByName(destinationName, 'destination'),
  ]);

  if (startBuilding.name === destinationBuilding.name) {
    throw ApiError.badRequest('Start and destination are the same location.', {
      code: 'SAME_LOCATION',
    });
  }

  // Two distinct buildings can share an access node (e.g. two entrances off the
  // same walkway). There is nothing to walk in that case.
  if (startBuilding.nearestNode === destinationBuilding.nearestNode) {
    const point = await loadPoint(startBuilding.nearestNode);
    return {
      start: startBuilding.name,
      destination: destinationBuilding.name,
      path: [point, point],
      distanceMeters: 0,
      estimatedMinutes: 1,
    };
  }

  // ----- STEP 2: retrieve the PREDEFINED route ----------------------------
  const route = await Route.findOne({
    startNode: startBuilding.nearestNode,
    endNode: destinationBuilding.nearestNode,
  }).lean();

  if (!route) {
    throw ApiError.notFound(
      `No predefined route exists between "${startBuilding.name}" and "${destinationBuilding.name}".`,
      {
        code: 'ROUTE_NOT_FOUND',
        details: {
          startNode: startBuilding.nearestNode,
          endNode: destinationBuilding.nearestNode,
        },
      }
    );
  }

  // ----- STEP 3: resolve node ids to coordinates --------------------------
  const path = await resolvePath(route.path);

  // ----- STEP 4: assemble the response ------------------------------------
  return {
    start: startBuilding.name,
    destination: destinationBuilding.name,
    path,
    distanceMeters: route.distanceMeters ?? null,
    estimatedMinutes: route.estimatedMinutes ?? null,
  };
}

/**
 * Fetches every node of a stored path in one query and returns them in the
 * order the route defines.
 *
 * @param {string[]} nodeIds
 * @returns {Promise<Array<{id: string, x: number, y: number}>>}
 */
async function resolvePath(nodeIds) {
  const docs = await Node.find({ nodeId: { $in: nodeIds } }).lean();
  const byId = new Map(docs.map((doc) => [doc.nodeId, doc]));

  const missing = nodeIds.filter((id) => !byId.has(id));
  if (missing.length > 0) {
    // A stored route referencing an unknown node is a data integrity problem,
    // not a user error.
    throw ApiError.internal('The stored route references nodes that no longer exist.', {
      code: 'CORRUPT_ROUTE',
      details: { missingNodes: missing },
    });
  }

  return nodeIds.map((id) => {
    const doc = byId.get(id);
    return { id: doc.nodeId, x: doc.x, y: doc.y };
  });
}

async function loadPoint(nodeId) {
  const doc = await Node.findOne({ nodeId }).lean();
  if (!doc) {
    throw ApiError.internal(`Node "${nodeId}" is missing from the map data.`, {
      code: 'CORRUPT_ROUTE',
    });
  }
  return { id: doc.nodeId, x: doc.x, y: doc.y };
}

/**
 * Returns every node on the campus. Used by the map overlay's optional
 * "show waypoints" debug layer.
 *
 * @returns {Promise<Array<{id: string, x: number, y: number, label: string}>>}
 */
async function listNodes() {
  const docs = await Node.find({}, { _id: 1, nodeId: 1, x: 1, y: 1, label: 1 })
    .sort({ nodeId: 1 })
    .lean();
  return docs.map((doc) => ({ id: doc._id.toString(), nodeId: doc.nodeId, x: doc.x, y: doc.y, label: doc.label || '', neighbors: doc.neighbors || [] }));
}

async function createNode(input = {}) {
  const node = await Node.create({
    nodeId: input.nodeId,
    x: input.x,
    y: input.y,
    label: input.label || '',
    neighbors: input.neighbors || [],
  });
  return node.toObject();
}

async function updateNode(id, input = {}) {
  const node = await Node.findById(id);
  if (!node) {
    throw ApiError.notFound('Node not found.', { code: 'NODE_NOT_FOUND' });
  }

  if (input.nodeId !== undefined) node.nodeId = input.nodeId;
  if (input.x !== undefined) node.x = input.x;
  if (input.y !== undefined) node.y = input.y;
  if (input.label !== undefined) node.label = input.label;
  if (input.neighbors !== undefined) node.neighbors = input.neighbors;

  await node.save();
  return node.toObject();
}

async function deleteNode(id) {
  const node = await Node.findByIdAndDelete(id);
  if (!node) {
    throw ApiError.notFound('Node not found.', { code: 'NODE_NOT_FOUND' });
  }
}

module.exports = { getNavigationRoute, listNodes, resolvePath, createNode, updateNode, deleteNode };
