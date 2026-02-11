const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const emailService = require('../services/emailService');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

// POST /api/v1/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, schoolId } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ status: 'fail', message: 'Email already registered' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const user = await User.create({
      name,
      email,
      password,
      school: schoolId || null,
      verificationToken,
    });

    await emailService.sendVerificationEmail(user.email, verificationToken);

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Please verify your email.',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ status: 'fail', message: 'Account suspended' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.status(200).json({
      status: 'success',
      data: { user, accessToken, refreshToken },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/refresh
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ status: 'fail', message: 'Refresh token required' });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ status: 'fail', message: 'Invalid refresh token' });
    }

    const tokens = generateTokens(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    res.status(200).json({ status: 'success', data: tokens });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'fail', message: 'Refresh token expired, please login again' });
    }
    next(err);
  }
};

// POST /api/v1/auth/logout
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/verify-email/:token
const verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).json({ status: 'fail', message: 'Invalid or expired verification token' });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(200).json({ status: 'success', message: 'If this email exists, a reset link was sent' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 min
    await user.save({ validateBeforeSave: false });

    await emailService.sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json({ status: 'success', message: 'If this email exists, a reset link was sent' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      passwordResetToken: req.params.token,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ status: 'fail', message: 'Invalid or expired reset token' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({ status: 'success', message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

// OAuth callback helper
const oauthCallback = async (req, res) => {
  const { accessToken, refreshToken } = generateTokens(req.user._id);
  await User.findByIdAndUpdate(req.user._id, { refreshToken });
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}&refresh=${refreshToken}`);
};

module.exports = { register, login, refreshToken, logout, verifyEmail, forgotPassword, resetPassword, oauthCallback };
