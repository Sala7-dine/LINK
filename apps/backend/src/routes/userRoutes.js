const express = require('express');
const { body } = require('express-validator');
const { getMe, updateMe, deleteMe, generateProfilePdf, uploadAvatar, getAllUsers, suspendUser, updateUserRole } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenant');
const { validate } = require('../middleware/validate');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

const tenantForSchoolAdminOnly = (req, res, next) => {
	if (req.user?.role === 'school_admin') {
		return tenantContext(req, res, next);
	}
	return next();
};

router.get('/me', getMe);
router.patch('/me', updateMe);
router.delete('/me', deleteMe);
router.get('/me/profile-pdf', generateProfilePdf);
router.patch('/me/avatar', upload.single('avatar'), uploadAvatar);

// Admin
router.get('/', authorize('school_admin', 'super_admin'), tenantForSchoolAdminOnly, getAllUsers);
router.patch(
	'/:id/suspend',
	authorize('school_admin', 'super_admin'),
	tenantForSchoolAdminOnly,
	[body('isActive').optional().isBoolean()],
	validate,
	suspendUser
);
router.patch(
	'/:id/role',
	authorize('school_admin', 'super_admin'),
	tenantForSchoolAdminOnly,
	[body('role').isIn(['student', 'school_admin', 'super_admin'])],
	validate,
	updateUserRole
);

module.exports = router;
