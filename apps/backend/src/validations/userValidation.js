import * as yup from 'yup';

const suspendUserSchema = yup.object({
  isActive: yup.boolean().required('isActive is required'),
});

const updateUserRoleSchema = yup.object({
  role: yup
    .string()
    .oneOf(['student', 'school_admin', 'company_admin', 'super_admin'], 'Invalid role')
    .required('role is required'),
});

export { suspendUserSchema, updateUserRoleSchema };
