const express = require('express');
const { verifyCard, getVoters, getVoterById, updateVoterStatus } = require('../controllers/voter.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.post('/verify', verifyCard);
router.get('/', authenticate, authorize('admin', 'super-admin'), getVoters);
router.get('/:id', authenticate, authorize('admin', 'super-admin'), getVoterById);
router.patch('/:id/status', authenticate, authorize('admin', 'super-admin'), updateVoterStatus);
module.exports = router;
