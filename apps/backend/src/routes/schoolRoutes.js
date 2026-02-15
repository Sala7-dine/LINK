const express = require('express');
const { getSchools, createSchool, updateSchool, importStudents } = require('../controllers/schoolController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);
router.get('/', authorize('superadmin'), getSchools);
router.post('/', authorize('superadmin'), createSchool);
router.patch('/:id', authorize('admin', 'superadmin'), updateSchool);
router.post('/:id/import-students', authorize('admin', 'superadmin'), upload.single('csv'), importStudents);

module.exports = router;
