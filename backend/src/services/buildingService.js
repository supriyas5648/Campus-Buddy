'use strict';

const Building = require('../models/Building');
const ApiError = require('../utils/ApiError');

/**
 * Returns every building name, alphabetically sorted.
 * This is the payload the frontend autocomplete is built from.
 *
 * @returns {Promise<string[]>}
 */
async function listBuildingNames() {
  const docs = await Building.find({}, { name: 1, _id: 0 }).sort({ name: 1 }).lean();
  return docs.map((doc) => doc.name);
}

/**
 * Returns every building with the metadata the UI uses for grouping, icons and
 * fuzzy matching.
 *
 * @returns {Promise<Array<{name: string, nearestNode: string, category: string, description: string, aliases: string[]}>>}
 */
async function listBuildingDetails() {
  return Building.find(
    {},
    { _id: 1, name: 1, nearestNode: 1, category: 1, description: 1, aliases: 1, image: 1, floors: 1 }
  )
    .sort({ name: 1 })
    .lean();
}

async function createBuilding(input = {}) {
  const building = await Building.create({
    name: input.name,
    category: input.category,
    description: input.description,
    nearestNode: input.nearestNode,
    aliases: input.aliases || [],
    image: input.image || '',
    floors: input.floors || 1,
  });
  return building.toObject();
}

async function updateBuilding(id, input = {}) {
  const building = await Building.findById(id);
  if (!building) {
    throw ApiError.notFound('Building not found.', { code: 'BUILDING_NOT_FOUND' });
  }

  if (input.name !== undefined) building.name = input.name;
  if (input.category !== undefined) building.category = input.category;
  if (input.description !== undefined) building.description = input.description;
  if (input.nearestNode !== undefined) building.nearestNode = input.nearestNode;
  if (input.aliases !== undefined) building.aliases = input.aliases;
  if (input.image !== undefined) building.image = input.image;
  if (input.floors !== undefined) building.floors = input.floors;

  await building.save();
  return building.toObject();
}

async function deleteBuilding(id) {
  const building = await Building.findByIdAndDelete(id);
  if (!building) {
    throw ApiError.notFound('Building not found.', { code: 'BUILDING_NOT_FOUND' });
  }
}

/**
 * Resolves a user-supplied place name to its building document.
 * Matching is case-insensitive and also considers aliases, so "admin" finds
 * "Admin Building".
 *
 * @param {string} name
 * @param {string} field Field name used in the error message ("start"/"destination")
 * @returns {Promise<import('mongoose').FlattenMaps<any>>}
 * @throws {ApiError} 404 when no building matches
 */
async function findBuildingByName(name, field = 'building') {
  const trimmed = String(name).trim();
  const exact = escapeRegExp(trimmed);

  const building = await Building.findOne({
    $or: [{ name: new RegExp(`^${exact}$`, 'i') }, { aliases: new RegExp(`^${exact}$`, 'i') }],
  }).lean();

  if (!building) {
    throw ApiError.notFound(`Unknown ${field} location: "${trimmed}".`, {
      code: 'BUILDING_NOT_FOUND',
      details: { field, value: trimmed },
    });
  }

  return building;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  listBuildingNames,
  listBuildingDetails,
  findBuildingByName,
  createBuilding,
  updateBuilding,
  deleteBuilding,
};
