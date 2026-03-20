jest.mock('../../models/Company.js');
jest.mock('../../models/User.js');
jest.mock('../../models/CompanyInvitation.js');
jest.mock('../../services/emailService.js');

import Company from '../../models/Company.js';
import {
  getCompany,
  createCompany,
  moderateCompany,
} from '../../controllers/companyController.js';

const makeMocks = (body = {}, params = {}, user = { _id: 'admin-id', role: 'school_admin', tenantId: 'tenant-1' }) => {
  const req = { body, params, user, tenantId: user.tenantId, query: {} };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  const next = jest.fn();
  return { req, res, next };
};

// ── getCompany ────────────────────────────────────────────────────────────────
describe('getCompany()', () => {
  it('returns 404 if company not found', async () => {
    Company.findOne.mockResolvedValue(null);
    const { req, res, next } = makeMocks({}, { id: 'company-id' });
    await getCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Company not found' }));
  });

  it('returns 200 with company data when found', async () => {
    const fakeCompany = { _id: 'company-id', name: 'Capgemini' };
    Company.findOne.mockResolvedValue(fakeCompany);
    const { req, res, next } = makeMocks({}, { id: 'company-id' });
    await getCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { company: fakeCompany } }));
  });

  it('calls next() on error', async () => {
    Company.findOne.mockRejectedValue(new Error('DB error'));
    const { req, res, next } = makeMocks({}, { id: 'company-id' });
    await getCompany(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── createCompany ─────────────────────────────────────────────────────────────
describe('createCompany()', () => {
  it('returns 201 with status "pending"', async () => {
    const fakeCompany = { _id: 'new-co', name: 'ACME', status: 'pending' };
    Company.create.mockResolvedValue(fakeCompany);
    const { req, res, next } = makeMocks({ name: 'ACME', city: 'Casablanca' });
    await createCompany(req, res, next);
    expect(Company.create).toHaveBeenCalledWith(expect.objectContaining({ status: 'pending', tenantId: 'tenant-1' }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('calls next() on error', async () => {
    Company.create.mockRejectedValue(new Error('Duplicate'));
    const { req, res, next } = makeMocks({ name: 'ACME' });
    await createCompany(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── moderateCompany ───────────────────────────────────────────────────────────
describe('moderateCompany()', () => {
  it('returns 400 if status is invalid', async () => {
    const { req, res, next } = makeMocks({ status: 'maybe' }, { id: 'co-id' });
    await moderateCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Status must be approved or rejected' }));
  });

  it('returns 200 when company is approved', async () => {
    const fakeCompany = { _id: 'co-id', status: 'approved' };
    Company.findOneAndUpdate.mockResolvedValue(fakeCompany);
    const { req, res, next } = makeMocks({ status: 'approved' }, { id: 'co-id' });
    await moderateCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { company: fakeCompany } }));
  });

  it('returns 200 when company is rejected', async () => {
    const fakeCompany = { _id: 'co-id', status: 'rejected' };
    Company.findOneAndUpdate.mockResolvedValue(fakeCompany);
    const { req, res, next } = makeMocks({ status: 'rejected' }, { id: 'co-id' });
    await moderateCompany(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
