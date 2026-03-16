import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/yupValidate.js';
import {
  getAllExperiences,
  getMyExperiences,
  createExperience,
} from '../controllers/experienceController.js';
import { createExperienceSchema } from '../validations/experienceValidation.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllExperiences);
router.get('/me', getMyExperiences);

router.post(
  '/',
  authorize('student'),
  validateBody(createExperienceSchema),
  createExperience
);

export default router;
