'use strict';

const asyncHandler = require('../middleware/asyncHandler');
const navigationService = require('../services/navigationService');

/**
 * POST /api/navigation
 *
 * Body:    { "start": "Main Gate", "destination": "Ayurveda Building" }
 * Returns: { success, start, destination, path: [{ id, x, y }], distanceMeters, estimatedMinutes }
 */
const postNavigation = asyncHandler(async (req, res) => {
  const { start, destination } = req.body;
  const result = await navigationService.getNavigationRoute(start, destination);

  res.status(200).json({
    success: true,
    start: result.start,
    destination: result.destination,
    path: result.path,
    distanceMeters: result.distanceMeters,
    estimatedMinutes: result.estimatedMinutes,
  });
});

/**
 * GET /api/navigation/nodes
 * Exposes the raw waypoint network. Handy while tracing a new campus SVG.
 */
const getNodes = asyncHandler(async (req, res) => {
  const nodes = await navigationService.listNodes();
  res.status(200).json({ success: true, count: nodes.length, nodes });
});

const createNode = asyncHandler(async (req, res) => {
  const node = await navigationService.createNode(req.body);
  res.status(201).json({ success: true, node });
});

const updateNode = asyncHandler(async (req, res) => {
  const node = await navigationService.updateNode(req.params.id, req.body);
  res.status(200).json({ success: true, node });
});

const deleteNode = asyncHandler(async (req, res) => {
  await navigationService.deleteNode(req.params.id);
  res.status(200).json({ success: true, message: 'Node deleted successfully.' });
});

module.exports = { postNavigation, getNodes, createNode, updateNode, deleteNode };
