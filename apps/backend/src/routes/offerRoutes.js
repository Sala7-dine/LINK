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
} from '../controllers/offerController.js';

import {authenticate, authorize} from '../middleware/auth.js';
import {tenantContext} from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticate, tenantContext);

router.get('/', getOffers);
router.get('/applications/me', getMyApplications);
router.get('/:id', getOffer);
router.post('/', authorize('school_admin', 'super_admin'), createOffer);
router.delete('/:id', authorize('school_admin', 'super_admin'), deleteOffer);
router.post('/sync', authorize('school_admin', 'super_admin'), syncExternalOffers);
router.post('/:id/apply', applyToOffer);
router.patch('/applications/:id', updateApplicationStatus);

export default router;
