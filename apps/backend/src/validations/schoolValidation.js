import * as yup from 'yup';

const inviteStudentSchema = yup.object({
  name: yup.string().trim().required('Name is required'),
  email: yup.string().trim().email('email must be a valid email').required('email is required'),
  promotion: yup
    .string()
    .trim()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});

export { inviteStudentSchema };
