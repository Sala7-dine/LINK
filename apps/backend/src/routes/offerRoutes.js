const express = require('express');
const {
  getOffers, getOffer, createOffer, deleteOffer, syncExternalOffers,
  getMyApplications, applyToOffer, updateApplicationStatus,
} = require('../controllers/offerController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getOffers);
router.get('/applications/me', authenticate, getMyApplications);
router.get('/:id', getOffer);
router.post('/', authenticate, authorize('admin', 'superadmin'), createOffer);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteOffer);
router.post('/sync', authenticate, authorize('admin', 'superadmin'), syncExternalOffers);
router.post('/:id/apply', authenticate, applyToOffer);
router.patch('/applications/:id', authenticate, updateApplicationStatus);

module.exports = router;
