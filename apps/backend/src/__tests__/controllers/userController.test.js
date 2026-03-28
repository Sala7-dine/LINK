jest.mock('../../models/User.js');
jest.mock('../../services/pdfService.js');

import User from '../../models/User.js';
import { getMe, updateMe, suspendUser, updateUserRole } from '../../controllers/userController.js';

const makeMocks = (
  body = {},
  params = {},
  user = { _id: 'admin-id', role: 'school_admin', tenantId: 'tenant-1' }
) => {
  const req = { body, params, query: {}, user, tenantId: user.tenantId };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  const next = jest.fn();
  return { req, res, next };
};

// ── getMe ─────────────────────────────────────────────────────────────────────
describe('getMe()', () => {
  it('returns 200 with the current user', async () => {
    const fakeUser = { _id: 'user-id', name: 'Salahdine' };
    User.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeUser) });

    const { req, res, next } = makeMocks();
    await getMe(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { user: fakeUser } }));
  });

  it('calls next() on error', async () => {
    User.findById.mockReturnValue({ populate: jest.fn().mockRejectedValue(new Error('DB error')) });
    const { req, res, next } = makeMocks();
    await getMe(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── updateMe ──────────────────────────────────────────────────────────────────
describe('updateMe()', () => {
  it('strips forbidden fields and returns 200', async () => {
    const updatedUser = { _id: 'user-id', name: 'Updated' };
    User.findByIdAndUpdate.mockReturnValue({ populate: jest.fn().mockResolvedValue(updatedUser) });

    const { req, res, next } = makeMocks({
      name: 'Updated',
      password: 'should-be-stripped',
      role: 'super_admin',
    });
    await updateMe(req, res, next);

    const updateCall = User.findByIdAndUpdate.mock.calls[0][1];
    expect(updateCall.password).toBeUndefined();
    expect(updateCall.role).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ── suspendUser ───────────────────────────────────────────────────────────────
describe('suspendUser()', () => {
  it('returns 400 if admin tries to suspend themselves', async () => {
    const { req, res, next } = makeMocks({ isActive: false }, { id: 'admin-id' });
    await suspendUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('own account') })
    );
  });

  it('returns 404 if user not found', async () => {
    User.findOneAndUpdate.mockResolvedValue(null);
    const { req, res, next } = makeMocks({ isActive: false }, { id: 'other-user-id' });
    await suspendUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on successful suspension', async () => {
    const suspendedUser = { _id: 'other-id', isActive: false };
    User.findOneAndUpdate.mockResolvedValue(suspendedUser);
    const { req, res, next } = makeMocks({ isActive: false }, { id: 'other-user-id' });
    await suspendUser(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });
});

// ── updateUserRole ────────────────────────────────────────────────────────────
describe('updateUserRole()', () => {
  it('returns 403 if requested role is not allowed for the editor', async () => {
    // school_admin cannot set super_admin role
    const { req, res, next } = makeMocks({ role: 'super_admin' }, { id: 'other-id' });
    await updateUserRole(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 400 if admin tries to change their own role', async () => {
    const { req, res, next } = makeMocks({ role: 'student' }, { id: 'admin-id' });
    await updateUserRole(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('own role') })
    );
  });

  it('returns 404 if user not found', async () => {
    User.findOneAndUpdate.mockResolvedValue(null);
    const { req, res, next } = makeMocks({ role: 'student' }, { id: 'other-id' });
    await updateUserRole(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on successful role update', async () => {
    const updatedUser = { _id: 'other-id', role: 'student' };
    User.findOneAndUpdate.mockResolvedValue(updatedUser);
    const { req, res, next } = makeMocks({ role: 'student' }, { id: 'other-id' });
    await updateUserRole(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
