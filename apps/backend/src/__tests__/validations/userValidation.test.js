import { suspendUserSchema, updateUserRoleSchema } from '../../validations/userValidation.js';

describe('suspendUserSchema', () => {
  it('validates isActive: true', async () => {
    const result = await suspendUserSchema.validate({ isActive: true });
    expect(result.isActive).toBe(true);
  });

  it('validates isActive: false', async () => {
    const result = await suspendUserSchema.validate({ isActive: false });
    expect(result.isActive).toBe(false);
  });

  it('rejects missing isActive', async () => {
    await expect(suspendUserSchema.validate({})).rejects.toThrow('isActive is required');
  });

  it('rejects non-boolean isActive', async () => {
    await expect(suspendUserSchema.validate({ isActive: 'yes' })).rejects.toThrow();
  });
});

describe('updateUserRoleSchema', () => {
  const validRoles = ['student', 'school_admin', 'company_admin', 'super_admin'];

  it.each(validRoles)('validates role: %s', async (role) => {
    const result = await updateUserRoleSchema.validate({ role });
    expect(result.role).toBe(role);
  });

  it('rejects invalid role', async () => {
    await expect(updateUserRoleSchema.validate({ role: 'hacker' })).rejects.toThrow('Invalid role');
  });

  it('rejects missing role', async () => {
    await expect(updateUserRoleSchema.validate({})).rejects.toThrow('role is required');
  });
});
