const express = require('express');
const {
  getOffers, getOffer, createOffer, deleteOffer, syncExternalOffers,
  getMyApplications, applyToOffer, updateApplicationStatus,
} = require('../controllers/offerController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenant');

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

module.exports = router;
