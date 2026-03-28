import express from 'express';

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  likeReview,
  flagReview,
  moderateReview,
} from '../controllers/reviewController.js';

import { authenticate, authorize } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenant.js';
import { validateBody } from '../middleware/yupValidate.js';
import upload from '../middleware/upload.js';
import { createReviewSchema } from '../validations/reviewValidation.js';

const router = express.Router({ mergeParams: true });

router.use(authenticate, tenantContext);

router.get('/', getReviews);

router.post('/', upload.array('attachments', 3), validateBody(createReviewSchema), createReview);

router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/like', likeReview);
router.post('/:id/flag', flagReview);
router.patch('/:id/moderate', authorize('school_admin', 'super_admin'), moderateReview);

export default router;
