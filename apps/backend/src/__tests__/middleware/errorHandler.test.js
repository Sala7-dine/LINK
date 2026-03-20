import { notFound, globalErrorHandler } from '../../middleware/errorHandler.js';

describe('notFound middleware', () => {
  it('calls next() with a 404 error', () => {
    const req = { originalUrl: '/unknown-route' };
    const res = {};
    const next = jest.fn();

    notFound(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0][0];
    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode).toBe(404);
    expect(error.message).toContain('/unknown-route');
  });
});

describe('globalErrorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('handles MongoDB duplicate key error (code 11000)', () => {
    const err = { code: 11000, keyValue: { email: 'test@test.com' } };
    globalErrorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'fail', message: expect.stringContaining('email') }));
  });

  it('handles Mongoose ValidationError', () => {
    const err = {
      name: 'ValidationError',
      errors: { name: { message: 'Name is required' } },
    };
    globalErrorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'fail', message: 'Name is required' }));
  });

  it('handles JsonWebTokenError', () => {
    const err = { name: 'JsonWebTokenError' };
    globalErrorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid token' }));
  });

  it('handles TokenExpiredError', () => {
    const err = { name: 'TokenExpiredError' };
    globalErrorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Token expired' }));
  });

  it('returns the error message for generic 4xx errors in development', () => {
    process.env.NODE_ENV = 'development';
    const err = { statusCode: 400, message: 'Bad input', stack: 'trace' };
    globalErrorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Bad input' }));
    process.env.NODE_ENV = 'test';
  });

  it('returns 500 for generic server errors in production', () => {
    process.env.NODE_ENV = 'production';
    const err = { statusCode: 500, message: 'Internal failure' };
    globalErrorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Something went wrong' }));
    process.env.NODE_ENV = 'test';
  });
});
