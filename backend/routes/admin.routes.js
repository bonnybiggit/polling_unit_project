const express = require('express');
const { getDashboard, getAuditLogs, getAdmins } = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();
router.get('/dashboard', authenticate, authorize('admin', 'super-admin'), getDashboard);
router.get('/audits', authenticate, authorize('super-admin'), getAuditLogs);
router.get('/users', authenticate, authorize('super-admin'), getAdmins);
module.exports = router;
