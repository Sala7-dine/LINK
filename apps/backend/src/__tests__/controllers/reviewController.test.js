jest.mock('../../models/Review.js');
jest.mock('../../models/Company.js');

import Review from '../../models/Review.js';
import Company from '../../models/Company.js';
import { createReview, likeReview, moderateReview } from '../../controllers/reviewController.js';

const makeMocks = (body = {}, params = {}, user = { _id: 'user-id', role: 'student', tenantId: 'tenant-1' }) => {
  const req = { body, params, user, tenantId: user.tenantId, files: null };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  const next = jest.fn();
  return { req, res, next };
};

// ── createReview ──────────────────────────────────────────────────────────────
describe('createReview()', () => {
  it('returns 201 with the created review', async () => {
    const fakeReview = { _id: 'rev-1', globalRating: 4 };
    Review.create.mockResolvedValue(fakeReview);

    const { req, res, next } = makeMocks({ globalRating: 4, content: 'Great company' }, { companyId: 'company-1' });
    await createReview(req, res, next);

    expect(Review.create).toHaveBeenCalledWith(expect.objectContaining({
      company: 'company-1',
      author: 'user-id',
    }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });

  it('calls next() on error', async () => {
    Review.create.mockRejectedValue(new Error('DB error'));
    const { req, res, next } = makeMocks({ globalRating: 3 }, { companyId: 'company-1' });
    await createReview(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── likeReview ────────────────────────────────────────────────────────────────
describe('likeReview()', () => {
  it('returns 404 if review not found', async () => {
    Review.findOne.mockResolvedValue(null);
    const { req, res, next } = makeMocks({}, { id: 'rev-1' });
    await likeReview(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('adds a like if user has not liked yet', async () => {
    const review = { likes: [], likesCount: 0, save: jest.fn().mockResolvedValue(true) };
    Review.findOne.mockResolvedValue(review);

    const { req, res, next } = makeMocks({}, { id: 'rev-1' });
    await likeReview(req, res, next);

    expect(review.likes).toContain('user-id');
    expect(review.likesCount).toBe(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { likesCount: 1 } }));
  });

  it('removes a like if user already liked', async () => {
    const review = { likes: ['user-id'], likesCount: 1, save: jest.fn().mockResolvedValue(true) };
    Review.findOne.mockResolvedValue(review);

    const { req, res, next } = makeMocks({}, { id: 'rev-1' });
    await likeReview(req, res, next);

    expect(review.likes).not.toContain('user-id');
    expect(review.likesCount).toBe(0);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: { likesCount: 0 } }));
  });
});

// ── moderateReview ─────────────────────────────────────────────────────────────
describe('moderateReview()', () => {
  it('returns 400 if status is invalid', async () => {
    const { req, res, next } = makeMocks({ status: 'maybe' }, { id: 'rev-1' });
    await moderateReview(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('approved or rejected') }));
  });

  it('returns 404 if review not found', async () => {
    Review.findOneAndUpdate.mockResolvedValue(null);
    const { req, res, next } = makeMocks({ status: 'approved' }, { id: 'rev-1' });
    await moderateReview(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 and recalculates rating on approval', async () => {
    const fakeReview = { _id: 'rev-1', status: 'approved', company: 'company-1' };
    Review.findOneAndUpdate.mockResolvedValue(fakeReview);
    // mock aggregate for recalcCompanyRating
    Review.aggregate.mockResolvedValue([]);
    Company.findOneAndUpdate.mockResolvedValue({});

    const { req, res, next } = makeMocks({ status: 'approved' }, { id: 'rev-1' });
    await moderateReview(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });
});
