import express from 'express';
import {
  getSchools,
  createSchool,
  updateSchool,
  importStudents,
  inviteStudent,
} from '../controllers/schoolController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadCsv } from '../middleware/upload.js';
import { validateBody } from '../middleware/yupValidate.js';
import { inviteStudentSchema } from '../validations/schoolValidation.js';

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('super_admin'), getSchools);
router.post('/', authorize('super_admin'), createSchool);
router.patch('/:id', authorize('school_admin', 'super_admin'), updateSchool);
router.post(
  '/:id/import-students',
  authorize('school_admin', 'super_admin'),
  uploadCsv.single('csv'),
  importStudents
);
router.post(
  '/:id/invite-student',
  authorize('school_admin', 'super_admin'),
  validateBody(inviteStudentSchema),
  inviteStudent
);

export default router;
