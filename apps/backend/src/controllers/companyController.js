import Company from '../models/Company.js';
import User from '../models/User.js';
import CompanyInvitation from '../models/CompanyInvitation.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';

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

// POST /api/v1/companies/invite (super_admin)
const inviteCompanyPartner = async (req, res, next) => {
  try {
    const { email, companyName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ status: 'fail', message: 'A user already exists with this email' });
    }

    const existingPending = await CompanyInvitation.findOne({
      email,
      status: 'pending',
      expiresAt: { $gt: new Date() },
    });

    if (existingPending) {
      return res.status(409).json({ status: 'fail', message: 'A pending invitation already exists for this email' });
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.randomBytes(32).toString('hex');

    const invitation = await CompanyInvitation.create({
      email,
      companyName,
      invitationToken,
      role: 'company_admin',
      invitedBy: req.user._id,
    });

    const companyAdminUser = await User.create({
      name: companyName || 'Company Admin',
      email,
      password: Math.random().toString(36).slice(-12),
      role: 'company_admin',
      isVerified: true,
    });

    companyAdminUser.passwordResetToken = passwordResetToken;
    companyAdminUser.passwordResetExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    await companyAdminUser.save({ validateBeforeSave: false });

    try {
      await sendPasswordResetEmail(email, passwordResetToken);
    } catch (emailErr) {
      await CompanyInvitation.findByIdAndDelete(invitation._id);
      await User.findByIdAndDelete(companyAdminUser._id);
      return res.status(500).json({
        status: 'error',
        message: 'Invitation created but email could not be sent. Please check SMTP configuration.',
      });
    }

    res.status(201).json({
      status: 'success',
      message: 'Partner invitation created and email sent successfully',
      data: {
        invitation: {
          id: invitation._id,
          email: invitation.email,
          companyName: invitation.companyName,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          invitedBy: invitation.invitedBy,
        },
        user: { id: companyAdminUser._id, email: companyAdminUser.email, role: companyAdminUser.role },
      },
    });
  } catch (err) {
    next(err);
  }
};

export { getCompanies, getCompany, createCompany, updateCompany, deleteCompany, moderateCompany, inviteCompanyPartner };
