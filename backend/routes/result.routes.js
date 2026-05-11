const express = require('express');
const { getAggregateResults, getLiveStatistics } = require('../controllers/result.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.get('/aggregate', authenticate, authorize('admin', 'super-admin'), getAggregateResults);
router.get('/stats', authenticate, authorize('admin', 'super-admin'), getLiveStatistics);
module.exports = router;
