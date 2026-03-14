const express = require('express');
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany, moderateCompany } = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/auth');
const { tenantContext } = require('../middleware/tenant');
const reviewRoutes = require('./reviewRoutes');

const router = express.Router();

router.use(authenticate, tenantContext);

// Nest reviews under company
router.use('/:companyId/reviews', reviewRoutes);

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', createCompany);
router.patch('/:id', authorize('school_admin', 'super_admin'), updateCompany);
router.delete('/:id', authorize('school_admin', 'super_admin'), deleteCompany);
router.patch('/:id/moderate', authorize('school_admin', 'super_admin'), moderateCompany);

module.exports = router;
