import express from 'express';
import { getDashboard, getSuperAdminDashboard } from '../controllers/dashboardController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenant.js';

const router = express.Router();

router.get(
  '/',
  authenticate,
  tenantContext,
  authorize('school_admin', 'super_admin'),
  getDashboard
);
router.get('/superadmin', authenticate, authorize('super_admin'), getSuperAdminDashboard);

export default router;
