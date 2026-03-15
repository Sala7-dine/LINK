import express from 'express';
import passport from 'passport';
import {body} from 'express-validator';

import {
  register,
  registerSchool,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  oauthCallback,
} from '../controllers/authController.js';

import {authenticate} from '../middleware/auth.js';
import {authLimiter} from '../middleware/rateLimiter.js';
import {validate} from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/register-school',
  authLimiter,
  [
    body('schoolName').trim().notEmpty().withMessage('School name is required'),
    body('adminName').trim().notEmpty().withMessage('Admin name is required'),
    body('adminEmail').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  registerSchool
);

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  login
);

router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.patch('/reset-password/:token', [body('password').isLength({ min: 8 })], validate, resetPassword);

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), oauthCallback);

export default router;
