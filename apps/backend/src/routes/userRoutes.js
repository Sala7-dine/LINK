import express from 'express';

import {
    getMe,
    updateMe,
    deleteMe,
    generateProfilePdf,
    uploadAvatar,
    getAllUsers,
    suspendUser,
    updateUserRole,
} from '../controllers/userController.js';

import {authenticate, authorize} from '../middleware/auth.js';
import {tenantContext} from '../middleware/tenant.js';
import {validateBody} from '../middleware/yupValidate.js';
import upload from '../middleware/upload.js';
import {suspendUserSchema, updateUserRoleSchema} from '../validations/userValidation.js';

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
	validateBody(suspendUserSchema),
	suspendUser
);
router.patch(
	'/:id/role',
	authorize('school_admin', 'super_admin'),
	tenantForSchoolAdminOnly,
	validateBody(updateUserRoleSchema),
	updateUserRole
);

export default router;
