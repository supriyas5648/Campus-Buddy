'use strict';

const express = require('express');
const {
  getBuildings,
  getBuildingDetails,
  createBuilding,
  updateBuilding,
  deleteBuilding,
} = require('../controllers/buildingController');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

const router = express.Router();

router.use(authenticate);

router.get('/', getBuildings);
router.get('/details', getBuildingDetails);
router.post('/', authorizeAdmin, createBuilding);
router.put('/:id', authorizeAdmin, updateBuilding);
router.delete('/:id', authorizeAdmin, deleteBuilding);

module.exports = router;
