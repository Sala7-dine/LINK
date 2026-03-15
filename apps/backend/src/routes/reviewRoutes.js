import express from 'express';
import {body} from 'express-validator';

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  flagReview,
  moderateReview,
} from '../controllers/reviewController.js';

import {authenticate, authorize} from '../middleware/auth.js';
import {tenantContext} from '../middleware/tenant.js';
import {validate} from '../middleware/validate.js';
import upload from '../middleware/upload.js';

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

export default router;
