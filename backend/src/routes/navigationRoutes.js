'use strict';

const express = require('express');
const {
  postNavigation,
  getNodes,
  createNode,
  updateNode,
  deleteNode,
} = require('../controllers/navigationController');
const validateNavigationRequest = require('../middleware/validateNavigationRequest');
const authenticate = require('../middleware/authenticate');
const authorizeAdmin = require('../middleware/authorizeAdmin');

const router = express.Router();

router.use(authenticate);

router.post('/', validateNavigationRequest, postNavigation);
router.get('/nodes', getNodes);
router.post('/nodes', authorizeAdmin, createNode);
router.put('/nodes/:id', authorizeAdmin, updateNode);
router.delete('/nodes/:id', authorizeAdmin, deleteNode);

module.exports = router;
