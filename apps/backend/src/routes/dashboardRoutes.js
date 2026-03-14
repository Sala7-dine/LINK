const express = require('express');
const { getDashboard, getSuperAdminDashboard } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenant');

const router = express.Router();

router.get('/', authenticate, tenantContext, authorize('school_admin', 'super_admin'), getDashboard);
router.get('/superadmin', authenticate, authorize('super_admin'), getSuperAdminDashboard);

module.exports = router;
