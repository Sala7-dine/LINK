import { createReviewSchema } from '../../validations/reviewValidation.js';

describe('createReviewSchema', () => {
  it('validates valid review data', async () => {
    const result = await createReviewSchema.validate({
      globalRating: 4,
      content: 'This is a great internship experience. The team was supportive and I learned a lot about development.',
    });
    expect(result.globalRating).toBe(4);
  });

  it('rejects missing globalRating', async () => {
    await expect(
      createReviewSchema.validate({ content: 'This is a great internship experience with lots of content to write here.' })
    ).rejects.toThrow('globalRating is required');
  });

  it('rejects globalRating below 1', async () => {
    await expect(
      createReviewSchema.validate({ globalRating: 0, content: 'This is a great internship experience with lots of content.' })
    ).rejects.toThrow('1 and 5');
  });

  it('rejects globalRating above 5', async () => {
    await expect(
      createReviewSchema.validate({ globalRating: 6, content: 'This is a great internship experience with lots of content.' })
    ).rejects.toThrow('1 and 5');
  });

  it('rejects non-integer globalRating', async () => {
    await expect(
      createReviewSchema.validate({ globalRating: 3.5, content: 'This is a great internship experience with lots of content.' })
    ).rejects.toThrow('integer');
  });

  it('rejects missing content', async () => {
    await expect(
      createReviewSchema.validate({ globalRating: 3 })
    ).rejects.toThrow('content is required');
  });

  it('rejects content shorter than 50 characters', async () => {
    await expect(
      createReviewSchema.validate({ globalRating: 3, content: 'Too short' })
    ).rejects.toThrow('50 characters');
  });

  it('accepts all ratings from 1 to 5', async () => {
    const longContent = 'This is a detailed review of the internship with enough content to pass the 50 character minimum.';
    for (let i = 1; i <= 5; i++) {
      const result = await createReviewSchema.validate({ globalRating: i, content: longContent });
      expect(result.globalRating).toBe(i);
    }
  });
});
