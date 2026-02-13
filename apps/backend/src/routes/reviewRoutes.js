const express = require('express');
const { body } = require('express-validator');
const { getReviews, createReview, updateReview, deleteReview, likeReview, flagReview, moderateReview } = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router({ mergeParams: true });

router.get('/', getReviews);

router.post(
  '/',
  authenticate,
  upload.array('attachments', 3),
  [
    body('globalRating').isInt({ min: 1, max: 5 }),
    body('content').isLength({ min: 50 }).withMessage('Review must be at least 50 characters'),
  ],
  validate,
  createReview
);

router.patch('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/like', authenticate, likeReview);
router.post('/:id/flag', authenticate, flagReview);
router.patch('/:id/moderate', authenticate, authorize('admin', 'superadmin'), moderateReview);

module.exports = router;
