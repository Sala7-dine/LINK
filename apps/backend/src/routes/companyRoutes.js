const express = require('express');
const { getCompanies, getCompany, createCompany, updateCompany, deleteCompany, moderateCompany } = require('../controllers/companyController');
const { authenticate, authorize } = require('../middleware/auth');
const reviewRoutes = require('./reviewRoutes');

const router = express.Router();

// Nest reviews under company
router.use('/:companyId/reviews', reviewRoutes);

router.get('/', getCompanies);
router.get('/:id', getCompany);
router.post('/', authenticate, createCompany);
router.patch('/:id', authenticate, authorize('admin', 'superadmin'), updateCompany);
router.delete('/:id', authenticate, authorize('admin', 'superadmin'), deleteCompany);
router.patch('/:id/moderate', authenticate, authorize('admin', 'superadmin'), moderateCompany);

module.exports = router;
