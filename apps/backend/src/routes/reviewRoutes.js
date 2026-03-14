const express = require('express');
const { body } = require('express-validator');
const { getReviews, createReview, updateReview, deleteReview, likeReview, flagReview, moderateReview } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenant');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router({ mergeParams: true });

router.use(authenticate, tenantContext);

router.get('/', getReviews);

router.post(
  '/',
  upload.array('attachments', 3),
  [
    body('globalRating').isInt({ min: 1, max: 5 }),
    body('content').isLength({ min: 50 }).withMessage('Review must be at least 50 characters'),
  ],
  validate,
  createReview
);

router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/like', likeReview);
router.post('/:id/flag', flagReview);
router.patch('/:id/moderate', authorize('school_admin', 'super_admin'), moderateReview);

module.exports = router;
