const User = require('../models/User');
const pdfService = require('../services/pdfService');

// GET /api/v1/users/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('tenantId', 'name logo primaryColor');
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/me
const updateMe = async (req, res, next) => {
  try {
    const forbidden = ['password', 'role', 'email', 'oauthId', 'oauthProvider'];
    forbidden.forEach((f) => delete req.body[f]);

    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    }).populate('tenantId', 'name logo primaryColor');

    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/users/me  (RGPD – Right to be forgotten)
const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      isActive: false,
      email: `deleted_${req.user._id}@deleted.invalid`,
      name: 'Deleted User',
      skills: [],
      projects: [],
      bio: null,
    });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/users/me/profile-pdf
const generateProfilePdf = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('tenantId', 'name logo primaryColor');
    const pdfBuffer = await pdfService.generateCandidateProfile(user);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="profile-${user._id}.pdf"` });
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/me/avatar
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ status: 'fail', message: 'No file uploaded' });
    const avatarUrl = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl }, { new: true });
    res.status(200).json({ status: 'success', data: { avatar: user.avatar } });
  } catch (err) {
    next(err);
  }
};

// ── Admin routes ──────────────────────────────────────────

// GET /api/v1/users  (admin)
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, school, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (school) query.tenantId = school;
    if (req.user.role === 'school_admin') query.tenantId = req.tenantId;
    if (search) query.$text = { $search: search };

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('tenantId', 'name')
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort('-createdAt');

    res.status(200).json({ status: 'success', total, page: Number(page), data: { users } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/users/:id/suspend  (admin)
const suspendUser = async (req, res, next) => {
  try {
    const filter = req.user.role === 'super_admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, tenantId: req.tenantId };
    const user = await User.findOneAndUpdate(filter, { isActive: false }, { new: true });
    if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, deleteMe, generateProfilePdf, uploadAvatar, getAllUsers, suspendUser };
