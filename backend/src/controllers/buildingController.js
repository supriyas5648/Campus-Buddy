'use strict';

const asyncHandler = require('../middleware/asyncHandler');
const buildingService = require('../services/buildingService');

/**
 * GET /api/buildings
 * Returns a plain array of building names for the autocomplete inputs:
 *   ["2-Wheeler Parking", "Admin Building", "Ayurveda Building", ...]
 */
const getBuildings = asyncHandler(async (req, res) => {
  const names = await buildingService.listBuildingNames();
  res.status(200).json(names);
});

/**
 * GET /api/buildings/details
 * Returns the same buildings enriched with category, description and aliases.
 */
const getBuildingDetails = asyncHandler(async (req, res) => {
  const buildings = await buildingService.listBuildingDetails();
  res.status(200).json({ success: true, count: buildings.length, buildings });
});

const createBuilding = asyncHandler(async (req, res) => {
  const building = await buildingService.createBuilding(req.body);
  res.status(201).json({ success: true, building });
});

const updateBuilding = asyncHandler(async (req, res) => {
  const building = await buildingService.updateBuilding(req.params.id, req.body);
  res.status(200).json({ success: true, building });
});

const deleteBuilding = asyncHandler(async (req, res) => {
  await buildingService.deleteBuilding(req.params.id);
  res.status(200).json({ success: true, message: 'Building deleted successfully.' });
});

module.exports = { getBuildings, getBuildingDetails, createBuilding, updateBuilding, deleteBuilding };
