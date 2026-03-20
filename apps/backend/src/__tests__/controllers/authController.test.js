// Mock dependencies before any imports
jest.mock('../../models/User.js');
jest.mock('../../models/School.js');
jest.mock('../../services/emailService.js');
jest.mock('jsonwebtoken');

import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import School from '../../models/School.js';
import { sendPasswordResetEmail } from '../../services/emailService.js';
import {
  register,
  login,
  refreshToken,
  logout,
} from '../../controllers/authController.js';

// Helper to create mock req/res/next
const makeMocks = (body = {}, params = {}, user = null) => {
  const req = { body, params, user };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  const next = jest.fn();
  return { req, res, next };
};

// Set up env vars for JWT
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
});

// ── register ────────────────────────────────────────────────────────────────
describe('register()', () => {
  it('always returns 403 (self-registration disabled)', async () => {
    const { req, res, next } = makeMocks();
    await register(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'fail' }));
  });
});

// ── login ────────────────────────────────────────────────────────────────────
describe('login()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 if user not found', async () => {
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const { req, res, next } = makeMocks({ email: 'x@x.com', password: 'pass123' });
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid credentials' }));
  });

  it('returns 401 if password does not match', async () => {
    const mockUser = { password: 'hashed', comparePassword: jest.fn().mockResolvedValue(false), isActive: true };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const { req, res, next } = makeMocks({ email: 'x@x.com', password: 'wrong' });
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 403 if account is suspended', async () => {
    const mockUser = { password: 'hashed', comparePassword: jest.fn().mockResolvedValue(true), isActive: false };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const { req, res, next } = makeMocks({ email: 'x@x.com', password: 'pass123' });
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Account suspended' }));
  });

  it('returns 200 with tokens on successful login', async () => {
    const mockUser = {
      _id: 'user-id-1',
      role: 'student',
      password: 'hashed',
      comparePassword: jest.fn().mockResolvedValue(true),
      isActive: true,
    };
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    User.findByIdAndUpdate.mockResolvedValue(mockUser);
    jwt.sign.mockReturnValue('mock-token');

    const { req, res, next } = makeMocks({ email: 'x@x.com', password: 'pass123' });
    await login(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });
});

// ── refreshToken ─────────────────────────────────────────────────────────────
describe('refreshToken()', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 if no token provided', async () => {
    const { req, res, next } = makeMocks({});
    await refreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Refresh token required' }));
  });

  it('returns 401 if token is invalid/user not found', async () => {
    jwt.verify.mockReturnValue({ id: 'user-id-1' });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    const { req, res, next } = makeMocks({ token: 'bad-token' });
    await refreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 if stored refreshToken does not match', async () => {
    jwt.verify.mockReturnValue({ id: 'user-id-1' });
    const mockUser = { _id: 'user-id-1', refreshToken: 'stored-token' };
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    const { req, res, next } = makeMocks({ token: 'different-token' });
    await refreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid refresh token' }));
  });

  it('returns 200 with new tokens on success', async () => {
    const token = 'valid-refresh-token';
    jwt.verify.mockReturnValue({ id: 'user-id-1' });
    const mockUser = { _id: 'user-id-1', role: 'student', refreshToken: token };
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
    User.findByIdAndUpdate.mockResolvedValue(mockUser);
    jwt.sign.mockReturnValue('new-mock-token');
    const { req, res, next } = makeMocks({ token });
    await refreshToken(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });
});

// ── logout ───────────────────────────────────────────────────────────────────
describe('logout()', () => {
  it('clears refresh token and returns 200', async () => {
    User.findByIdAndUpdate.mockResolvedValue({});
    const { req, res, next } = makeMocks({}, {}, { _id: 'user-id-1' });
    await logout(req, res, next);
    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-id-1', { refreshToken: null });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });
});
