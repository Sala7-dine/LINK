import express from 'express';
import passport from 'passport';

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
import {validateBody} from '../middleware/yupValidate.js';
import {
  registerSchoolSchema,
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

const router = express.Router();

router.post(
  '/register-school',
  authLimiter,
  validateBody(registerSchoolSchema),
  registerSchool
);

router.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  register
);

router.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  login
);

router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.patch('/reset-password/:token', validateBody(resetPasswordSchema), resetPassword);

// OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), oauthCallback);

export default router;
