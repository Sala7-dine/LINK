import * as yup from 'yup';

const registerSchoolSchema = yup.object({
  schoolName: yup.string().trim().required('School name is required'),
  adminName: yup.string().trim().required('Admin name is required'),
  adminEmail: yup
    .string()
    .trim()
    .email('adminEmail must be a valid email')
    .required('adminEmail is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const registerSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  email: yup.string().trim().email('email must be a valid email').required('email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const loginSchema = yup.object({
  email: yup.string().trim().email('email must be a valid email').required('email is required'),
  password: yup.string().required('password is required'),
});

const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export { registerSchoolSchema, registerSchema, loginSchema, resetPasswordSchema };
