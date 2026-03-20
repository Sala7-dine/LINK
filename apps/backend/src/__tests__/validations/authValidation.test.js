import { loginSchema, registerSchoolSchema, resetPasswordSchema } from '../../validations/authValidation.js';

describe('loginSchema', () => {
  it('validates correct credentials', async () => {
    const result = await loginSchema.validate({ email: 'test@example.com', password: 'secret123' });
    expect(result.email).toBe('test@example.com');
  });

  it('rejects missing email', async () => {
    await expect(loginSchema.validate({ password: 'secret123' })).rejects.toThrow('email is required');
  });

  it('rejects invalid email format', async () => {
    await expect(loginSchema.validate({ email: 'not-an-email', password: 'secret123' })).rejects.toThrow('valid email');
  });

  it('rejects missing password', async () => {
    await expect(loginSchema.validate({ email: 'test@example.com' })).rejects.toThrow('password is required');
  });
});

describe('registerSchoolSchema', () => {
  const valid = {
    schoolName: 'YouCode',
    adminName: 'Salahdine',
    adminEmail: 'admin@youcode.ma',
    password: 'superSecret123',
  };

  it('validates correct data', async () => {
    const result = await registerSchoolSchema.validate(valid);
    expect(result.schoolName).toBe('YouCode');
  });

  it('rejects missing schoolName', async () => {
    await expect(registerSchoolSchema.validate({ ...valid, schoolName: '' })).rejects.toThrow('School name is required');
  });

  it('rejects invalid adminEmail', async () => {
    await expect(registerSchoolSchema.validate({ ...valid, adminEmail: 'not-email' })).rejects.toThrow('valid email');
  });

  it('rejects password shorter than 8 chars', async () => {
    await expect(registerSchoolSchema.validate({ ...valid, password: '1234' })).rejects.toThrow('8 characters');
  });
});

describe('resetPasswordSchema', () => {
  it('validates a strong password', async () => {
    const result = await resetPasswordSchema.validate({ password: 'newPassword123' });
    expect(result.password).toBe('newPassword123');
  });

  it('rejects password shorter than 8 chars', async () => {
    await expect(resetPasswordSchema.validate({ password: 'weak' })).rejects.toThrow('8 characters');
  });

  it('rejects empty password', async () => {
    await expect(resetPasswordSchema.validate({})).rejects.toThrow('Password is required');
  });
});
