const express = require('express');
const { getCandidates, createCandidate, updateCandidate, deleteCandidate } = require('../controllers/candidate.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.get('/', getCandidates);
router.post('/', authenticate, authorize('admin', 'super-admin'), createCandidate);
router.patch('/:id', authenticate, authorize('admin', 'super-admin'), updateCandidate);
router.delete('/:id', authenticate, authorize('super-admin'), deleteCandidate);
module.exports = router;
