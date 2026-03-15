import express from 'express';
import {body} from 'express-validator';
import {getSchools, createSchool, updateSchool, importStudents, inviteStudent} from '../controllers/schoolController.js';
import {authenticate, authorize} from '../middleware/auth.js';
import {uploadCsv} from '../middleware/upload.js';
import {validate} from '../middleware/validate.js';

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('super_admin'), getSchools);
router.post('/', authorize('super_admin'), createSchool);
router.patch('/:id', authorize('school_admin', 'super_admin'), updateSchool);
router.post('/:id/import-students', authorize('school_admin', 'super_admin'), uploadCsv.single('csv'), importStudents);
router.post(
	'/:id/invite-student',
	authorize('school_admin', 'super_admin'),
	[
		body('name').trim().notEmpty().withMessage('Name is required'),
		body('email').isEmail().normalizeEmail(),
		body('promotion').optional().trim(),
	],
	validate,
	inviteStudent
);

export default router;
