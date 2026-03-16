import express from 'express';
import { body } from 'express-validator';

import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  moderateCompany,
  inviteCompanyPartner,
} from '../controllers/companyController.js';

import {authenticate, authorize} from '../middleware/auth.js';
import {tenantContext} from '../middleware/tenant.js';
import { validate } from '../middleware/validate.js';
import reviewRoutes from './reviewRoutes.js';

const router = express.Router();

router.post(
  '/invite',
  authenticate,
  authorize('super_admin'),
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('companyName').optional().trim(),
  ],
  validate,
  inviteCompanyPartner
);

router.use(authenticate, tenantContext);

// Nest reviews under company
router.use('/:companyId/reviews', reviewRoutes);

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', createCompany);
router.patch('/:id', authorize('school_admin', 'super_admin'), updateCompany);
router.delete('/:id', authorize('school_admin', 'super_admin'), deleteCompany);
router.patch('/:id/moderate', authorize('school_admin', 'super_admin'), moderateCompany);

export default router;
