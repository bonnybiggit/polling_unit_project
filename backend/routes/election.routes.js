const express = require('express');
const { getElections, createElection, updateElection, getPositions } = require('../controllers/election.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.get('/', authenticate, authorize('admin', 'super-admin'), getElections);
router.post('/', authenticate, authorize('super-admin'), createElection);
router.patch('/:id', authenticate, authorize('super-admin'), updateElection);
router.get('/positions', authenticate, authorize('admin', 'super-admin'), getPositions);
module.exports = router;
