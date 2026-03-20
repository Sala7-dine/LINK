jest.mock('../../models/Offer.js');
jest.mock('../../models/Application.js');
jest.mock('../../services/aggregatorService.js');

import Offer from '../../models/Offer.js';
import Application from '../../models/Application.js';
import {
  createOffer,
  applyToOffer,
  updateCompanyApplicationStatus,
} from '../../controllers/offerController.js';

const makeMocks = (body = {}, params = {}, user = { _id: 'admin-id', role: 'school_admin', tenantId: 'tenant-1' }, query = {}) => {
  const req = { body, params, user, tenantId: user.tenantId, query };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  const next = jest.fn();
  return { req, res, next };
};

// ── createOffer ───────────────────────────────────────────────────────────────
describe('createOffer()', () => {
  it('returns 400 if company_admin does not provide companyName', async () => {
    const { req, res, next } = makeMocks(
      { title: 'Dev Offer' },
      {},
      { _id: 'company-admin-id', role: 'company_admin' }
    );
    await createOffer(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('companyName') }));
  });

  it('returns 201 for a company_admin with companyName', async () => {
    const fakeOffer = { _id: 'offer-1', title: 'Dev Offer', companyName: 'ACME' };
    Offer.create.mockResolvedValue(fakeOffer);
    const { req, res, next } = makeMocks(
      { title: 'Dev Offer', companyName: 'ACME' },
      {},
      { _id: 'company-admin-id', role: 'company_admin' }
    );
    await createOffer(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });

  it('returns 201 for a school_admin with tenantId', async () => {
    const fakeOffer = { _id: 'offer-2', title: 'School Offer' };
    Offer.create.mockResolvedValue(fakeOffer);
    const { req, res, next } = makeMocks({ title: 'School Offer' });
    await createOffer(req, res, next);
    expect(Offer.create).toHaveBeenCalledWith(expect.objectContaining({ tenantId: 'tenant-1' }));
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('calls next() on error', async () => {
    Offer.create.mockRejectedValue(new Error('DB error'));
    const { req, res, next } = makeMocks({ title: 'Offer' });
    await createOffer(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── applyToOffer ──────────────────────────────────────────────────────────────
describe('applyToOffer()', () => {
  it('returns 403 if tenantId is missing', async () => {
    const { req, res, next } = makeMocks(
      {},
      { id: 'offer-id' },
      { _id: 'student-id', role: 'student', tenantId: null }
    );
    req.tenantId = null;
    await applyToOffer(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 201 on successful application', async () => {
    const fakeApp = { _id: 'app-1', student: 'student-id', offer: 'offer-id' };
    Application.create.mockResolvedValue(fakeApp);
    const { req, res, next } = makeMocks(
      { status: 'interested' },
      { id: 'offer-id' },
      { _id: 'student-id', role: 'student', tenantId: 'tenant-1' }
    );
    await applyToOffer(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { application: fakeApp } }));
  });
});

// ── updateCompanyApplicationStatus ────────────────────────────────────────────
describe('updateCompanyApplicationStatus()', () => {
  it('returns 400 for invalid status', async () => {
    const { req, res, next } = makeMocks({ status: 'maybe' }, { id: 'app-1' });
    await updateCompanyApplicationStatus(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('interview, accepted, rejected') }));
  });

  it('returns 404 if application not found', async () => {
    Application.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
    const { req, res, next } = makeMocks({ status: 'interview' }, { id: 'app-1' });
    await updateCompanyApplicationStatus(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 if company_admin tries to update an application for another company offer', async () => {
    const fakeApp = {
      _id: 'app-1',
      offer: { postedBy: 'other-admin-id', _id: 'offer-id' },
      status: 'interested',
      save: jest.fn(),
      populate: jest.fn(),
    };
    Application.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeApp) });
    const { req, res, next } = makeMocks(
      { status: 'interview' },
      { id: 'app-1' },
      { _id: 'company-admin-id', role: 'company_admin', tenantId: 'tenant-1' }
    );
    await updateCompanyApplicationStatus(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 200 on successful status update by company_admin for their own offer', async () => {
    const fakeApp = {
      _id: 'app-1',
      offer: { postedBy: 'company-admin-id', _id: 'offer-id' },
      status: 'interested',
      save: jest.fn().mockResolvedValue(true),
      populate: jest.fn().mockResolvedValue(true),
    };
    Application.findById.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeApp) });
    const { req, res, next } = makeMocks(
      { status: 'interview' },
      { id: 'app-1' },
      { _id: 'company-admin-id', role: 'company_admin', tenantId: 'tenant-1' }
    );
    await updateCompanyApplicationStatus(req, res, next);
    expect(fakeApp.status).toBe('interview');
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
