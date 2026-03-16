import * as yup from 'yup';

const createReviewSchema = yup.object({
  globalRating: yup
    .number()
    .typeError('globalRating must be a number')
    .integer('globalRating must be an integer')
    .min(1, 'globalRating must be between 1 and 5')
    .max(5, 'globalRating must be between 1 and 5')
    .required('globalRating is required'),
  content: yup
    .string()
    .min(50, 'Review must be at least 50 characters')
    .required('content is required'),
});

export { createReviewSchema };
