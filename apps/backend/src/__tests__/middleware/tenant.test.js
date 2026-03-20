import { tenantContext } from '../../middleware/tenant.js';

describe('tenantContext middleware', () => {
  let req, res, next;

  beforeEach(() => {
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('returns 403 if req.user is missing', () => {
    req = {};
    tenantContext(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'fail' }));
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 if req.user.tenantId is null', () => {
    req = { user: { tenantId: null } };
    tenantContext(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches tenantId to req and calls next() if tenantId is present', () => {
    const tenantId = 'school-abc-123';
    req = { user: { tenantId } };
    tenantContext(req, res, next);
    expect(req.tenantId).toBe(tenantId);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
