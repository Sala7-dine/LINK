import express from 'express';
import { body } from 'express-validator';
import { authenticate, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  getAllExperiences,
  getMyExperiences,
  createExperience,
} from '../controllers/experienceController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAllExperiences);
router.get('/me', getMyExperiences);

router.post(
  '/',
  authorize('student'),
  [
    body('companyName').trim().notEmpty().withMessage('Company name is required'),
    body('experienceType')
      .isIn(['first_year_internship', 'second_year_internship', 'second_year_cdi'])
      .withMessage('Invalid experience type'),
    body('startDate').isISO8601().withMessage('Start date must be a valid date'),
    body('endDate')
      .isISO8601()
      .withMessage('End date must be a valid date')
      .custom((value, { req }) => {
        const start = new Date(req.body.startDate);
        const end = new Date(value);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
          throw new Error('End date must be after start date');
        }
        return true;
      }),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('companyLinkedinUrl').optional({ values: 'falsy' }).isURL().withMessage('LinkedIn URL is invalid'),
    body('companyWebsiteUrl').optional({ values: 'falsy' }).isURL().withMessage('Website URL is invalid'),
  ],
  validate,
  createExperience
);

export default router;
