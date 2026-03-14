const express = require('express');
const { getSchools, createSchool, updateSchool, importStudents } = require('../controllers/schoolController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('super_admin'), getSchools);
router.post('/', authorize('super_admin'), createSchool);
router.patch('/:id', authorize('school_admin', 'super_admin'), updateSchool);
router.post('/:id/import-students', authorize('school_admin', 'super_admin'), upload.single('csv'), importStudents);

module.exports = router;
