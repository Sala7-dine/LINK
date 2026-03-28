jest.mock('../../models/Experience.js');

import Experience from '../../models/Experience.js';
import {
  getAllExperiences,
  getMyExperiences,
  createExperience,
} from '../../controllers/experienceController.js';

const makeMocks = (body = {}, params = {}, query = {}, user = { _id: 'user-001' }) => {
  const req = { body, params, query, user };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  const next = jest.fn();
  return { req, res, next };
};

// ── getAllExperiences ─────────────────────────────────────────────────────────
describe('getAllExperiences()', () => {
  it('returns 200 with a list of experiences', async () => {
    const fakeExperiences = [{ _id: 'exp-1', companyName: 'Capgemini' }];
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue(fakeExperiences),
    };
    Experience.countDocuments.mockResolvedValue(1);
    Experience.find.mockReturnValue(mockQuery);

    const { req, res, next } = makeMocks({}, {}, { page: '1', limit: '10' });
    await getAllExperiences(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        total: 1,
        data: { experiences: fakeExperiences },
      })
    );
  });

  it('returns all experiences when limit is "all"', async () => {
    const fakeExperiences = [{ _id: 'exp-1' }, { _id: 'exp-2' }];
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(fakeExperiences),
    };
    Experience.countDocuments.mockResolvedValue(2);
    Experience.find.mockReturnValue(mockQuery);

    const { req, res, next } = makeMocks({}, {}, { limit: 'all' });
    await getAllExperiences(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 2 }));
  });

  it('calls next() on error', async () => {
    Experience.countDocuments.mockRejectedValue(new Error('DB error'));
    const { req, res, next } = makeMocks({}, {}, {});
    await getAllExperiences(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── getMyExperiences ──────────────────────────────────────────────────────────
describe('getMyExperiences()', () => {
  it('returns 200 with experiences belonging to the user', async () => {
    const fakeExperiences = [{ _id: 'exp-1', author: 'user-001', companyName: 'Tessi' }];
    Experience.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeExperiences) });

    const { req, res, next } = makeMocks();
    await getMyExperiences(req, res, next);

    expect(Experience.find).toHaveBeenCalledWith({ author: 'user-001' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'success', data: { experiences: fakeExperiences } })
    );
  });

  it('calls next() on error', async () => {
    Experience.find.mockReturnValue({ sort: jest.fn().mockRejectedValue(new Error('DB fail')) });
    const { req, res, next } = makeMocks();
    await getMyExperiences(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// ── createExperience ──────────────────────────────────────────────────────────
describe('createExperience()', () => {
  const expBody = {
    companyName: 'Capgemini',
    experienceType: 'first_year_internship',
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    location: 'Casablanca',
  };

  it('returns 201 with the created experience', async () => {
    const savedExp = {
      _id: 'exp-new',
      ...expBody,
      populate: jest.fn().mockResolvedValue({ _id: 'exp-new', ...expBody }),
    };
    Experience.create.mockResolvedValue(savedExp);

    const { req, res, next } = makeMocks(expBody);
    await createExperience(req, res, next);

    expect(Experience.create).toHaveBeenCalledWith(
      expect.objectContaining({ companyName: 'Capgemini', author: 'user-001' })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'success' }));
  });

  it('calls next() on error', async () => {
    Experience.create.mockRejectedValue(new Error('Validation error'));
    const { req, res, next } = makeMocks(expBody);
    await createExperience(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
