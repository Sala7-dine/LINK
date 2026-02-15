const express = require('express');
const { getDashboard, getSuperAdminDashboard } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('admin', 'superadmin'), getDashboard);
router.get('/superadmin', authorize('superadmin'), getSuperAdminDashboard);

module.exports = router;
