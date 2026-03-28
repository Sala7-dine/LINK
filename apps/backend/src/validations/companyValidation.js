import * as yup from 'yup';

const inviteCompanyPartnerSchema = yup.object({
  email: yup.string().trim().email('Valid email is required').required('email is required'),
  companyName: yup
    .string()
    .trim()
    .nullable()
    .transform((value) => (value === '' ? null : value)),
});

export { inviteCompanyPartnerSchema };
