import express from 'express';

import {
  getOffers,
  getOffer,
  createOffer,
  deleteOffer,
  syncExternalOffers,
  getMyApplications,
  applyToOffer,
  updateApplicationStatus,
  getCompanyApplicants,
  updateCompanyApplicationStatus,
} from '../controllers/offerController.js';

import {authenticate, authorize} from '../middleware/auth.js';
import {tenantContext} from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticate);

const tenantForSchoolAndStudent = (req, res, next) => {
  if (['school_admin', 'student'].includes(req.user?.role)) {
    return tenantContext(req, res, next);
  }
  return next();
};

router.get('/', tenantForSchoolAndStudent, getOffers);
router.get('/applications/me', tenantForSchoolAndStudent, getMyApplications);
router.get('/company/applicants', authorize('company_admin', 'super_admin'), getCompanyApplicants);
router.patch('/company/applications/:id/status', authorize('company_admin', 'super_admin'), updateCompanyApplicationStatus);
router.get('/:id', tenantForSchoolAndStudent, getOffer);
router.post('/', tenantForSchoolAndStudent, authorize('school_admin', 'company_admin', 'super_admin'), createOffer);
router.delete('/:id', tenantForSchoolAndStudent, authorize('school_admin', 'company_admin', 'super_admin'), deleteOffer);
router.post('/sync', authorize('school_admin', 'super_admin'), syncExternalOffers);
router.post('/:id/apply', tenantForSchoolAndStudent, applyToOffer);
router.patch('/applications/:id', tenantForSchoolAndStudent, updateApplicationStatus);

export default router;
