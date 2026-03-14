const express = require('express');
const { getMe, updateMe, deleteMe, generateProfilePdf, uploadAvatar, getAllUsers, suspendUser } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenant');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);
router.use(tenantContext);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.delete('/me', deleteMe);
router.get('/me/profile-pdf', generateProfilePdf);
router.patch('/me/avatar', upload.single('avatar'), uploadAvatar);

// Admin
router.get('/', authorize('school_admin', 'super_admin'), getAllUsers);
router.patch('/:id/suspend', authorize('school_admin', 'super_admin'), suspendUser);

module.exports = router;
