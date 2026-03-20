import { createExperienceSchema } from '../../validations/experienceValidation.js';

const validPayload = {
  companyName: 'Capgemini',
  experienceType: 'first_year_internship',
  startDate: '2024-01-01',
  endDate: '2024-06-30',
  location: 'Casablanca',
};

describe('createExperienceSchema', () => {
  it('validates a complete valid payload', async () => {
    const result = await createExperienceSchema.validate(validPayload);
    expect(result.companyName).toBe('Capgemini');
    expect(result.experienceType).toBe('first_year_internship');
  });

  it('rejects missing companyName', async () => {
    const { companyName, ...rest } = validPayload;
    await expect(createExperienceSchema.validate(rest)).rejects.toThrow('Company name is required');
  });

  it('rejects companyName exceeding 120 characters', async () => {
    const long = 'A'.repeat(121);
    await expect(createExperienceSchema.validate({ ...validPayload, companyName: long })).rejects.toThrow('120 characters');
  });

  it('rejects invalid experienceType', async () => {
    await expect(
      createExperienceSchema.validate({ ...validPayload, experienceType: 'invalid_type' })
    ).rejects.toThrow('Invalid experience type');
  });

  it('rejects when startDate is missing (either required or endDate constraint fires)', async () => {
    const { startDate, ...rest } = validPayload;
    // When startDate is absent, Yup evaluates endDate.min(ref('startDate')) first,
    // which can throw before the required check. Either error is acceptable.
    await expect(createExperienceSchema.validate(rest)).rejects.toThrow(
      /Start date is required|End date must be after start date/
    );
  });

  it('rejects endDate before startDate', async () => {
    await expect(
      createExperienceSchema.validate({ ...validPayload, endDate: '2023-01-01' })
    ).rejects.toThrow('End date must be after start date');
  });

  it('rejects missing location', async () => {
    const { location, ...rest } = validPayload;
    await expect(createExperienceSchema.validate(rest)).rejects.toThrow('Location is required');
  });

  it('rejects invalid LinkedIn URL', async () => {
    await expect(
      createExperienceSchema.validate({ ...validPayload, companyLinkedinUrl: 'not-a-url' })
    ).rejects.toThrow('invalid');
  });

  it('accepts optional fields as null/empty', async () => {
    const result = await createExperienceSchema.validate({
      ...validPayload,
      description: '',
      companyLinkedinUrl: '',
      companyWebsiteUrl: '',
    });
    expect(result.description).toBeNull();
    expect(result.companyLinkedinUrl).toBeNull();
  });

  it('accepts all three valid experienceType values', async () => {
    const types = ['first_year_internship', 'second_year_internship', 'second_year_cdi'];
    for (const type of types) {
      const result = await createExperienceSchema.validate({ ...validPayload, experienceType: type });
      expect(result.experienceType).toBe(type);
    }
  });
});
