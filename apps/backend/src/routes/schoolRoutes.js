const express = require('express');
const { body } = require('express-validator');
const { getSchools, createSchool, updateSchool, importStudents, inviteStudent } = require('../controllers/schoolController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadCsv } = require('../middleware/upload');
const { validate } = require('../middleware/validate');

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

module.exports = router;
