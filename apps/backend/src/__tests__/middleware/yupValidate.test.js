import { validateBody } from '../../middleware/yupValidate.js';
import * as yup from 'yup';

describe('validateBody middleware', () => {
  let req, res, next;

  beforeEach(() => {
    next = jest.fn();
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  const schema = yup.object({
    name: yup.string().required('Name is required'),
    age: yup.number().min(1).required('Age is required'),
  });

  it('calls next() and replaces req.body with validated data when valid', async () => {
    req = { body: { name: 'Alice', age: 25, extra: 'stripped' } };
    await validateBody(schema)(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(req.body).toEqual({ name: 'Alice', age: 25 }); // extra stripped
  });

  it('returns 422 with error details when validation fails', async () => {
    req = { body: { age: -1 } }; // name missing, age invalid
    await validateBody(schema)(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'fail',
        message: 'Validation failed',
        errors: expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
        ]),
      })
    );
  });

  it('returns 422 with all errors (abortEarly: false)', async () => {
    req = { body: {} };
    await validateBody(schema)(req, res, next);
    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg.errors.length).toBeGreaterThanOrEqual(2);
  });
});
