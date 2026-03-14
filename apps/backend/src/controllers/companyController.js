const Company = require('../models/Company');

// GET /api/v1/companies
const getCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, city, tech, status = 'approved' } = req.query;
    const query = { tenantId: req.tenantId };
    if (status) query.status = status;
    if (city) query.city = new RegExp(city, 'i');
    if (tech) query.technologies = new RegExp(tech, 'i');
    if (search) query.$text = { $search: search };

    const total = await Company.countDocuments(query);
    const companies = await Company.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-averageRating -reviewCount');

    res.status(200).json({ status: 'success', total, page: Number(page), data: { companies } });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/companies/:id
const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, tenantId: req.tenantId });
    if (!company) return res.status(404).json({ status: 'fail', message: 'Company not found' });
    res.status(200).json({ status: 'success', data: { company } });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/companies
const createCompany = async (req, res, next) => {
  try {
    const company = await Company.create({
      ...req.body,
      tenantId: req.tenantId,
      addedBy: req.user._id,
      status: 'pending',
    });
    res.status(201).json({ status: 'success', data: { company } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/companies/:id
const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!company) return res.status(404).json({ status: 'fail', message: 'Company not found' });
    res.status(200).json({ status: 'success', data: { company } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/companies/:id (admin)
const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findOneAndDelete({ _id: req.params.id, tenantId: req.tenantId });
    if (!company) return res.status(404).json({ status: 'fail', message: 'Company not found' });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/companies/:id/moderate (admin)
const moderateCompany = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Status must be approved or rejected' });
    }
    const company = await Company.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.tenantId },
      { status },
      { new: true }
    );
    res.status(200).json({ status: 'success', data: { company } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCompanies, getCompany, createCompany, updateCompany, deleteCompany, moderateCompany };
