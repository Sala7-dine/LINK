import * as yup from 'yup';

const EXPERIENCE_TYPES = ['first_year_internship', 'second_year_internship', 'second_year_cdi'];

const createExperienceSchema = yup.object({
  companyName: yup
    .string()
    .trim()
    .max(120, 'Company name cannot exceed 120 characters')
    .required('Company name is required'),
  experienceType: yup
    .string()
    .oneOf(EXPERIENCE_TYPES, 'Invalid experience type')
    .required('Experience type is required'),
  startDate: yup
    .date()
    .typeError('Start date must be a valid date')
    .required('Start date is required'),
  endDate: yup
    .date()
    .typeError('End date must be a valid date')
    .min(yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
  location: yup
    .string()
    .trim()
    .max(120, 'Location cannot exceed 120 characters')
    .required('Location is required'),
  description: yup
    .string()
    .trim()
    .max(1000, 'Description cannot exceed 1000 characters')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  technologies: yup
    .array()
    .of(yup.string().trim().required('Each technology must be a string'))
    .nullable()
    .transform((value) => (value == null ? [] : value)),
  companyLinkedinUrl: yup
    .string()
    .trim()
    .url('LinkedIn URL is invalid')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
  companyWebsiteUrl: yup
    .string()
    .trim()
    .url('Website URL is invalid')
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});

export { createExperienceSchema };
