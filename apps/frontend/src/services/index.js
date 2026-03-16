import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  registerSchool: (data) => api.post('/auth/register-school', data),
  login: (data) => api.post('/auth/login', data),
  resetPassword: (token, data) => api.patch(`/auth/reset-password/${token}`, data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/users/me'),
};

export const companyService = {
  getAll: (params) => api.get('/companies', { params }),
  getOne: (id) => api.get(`/companies/${id}`),
  create: (data) => api.post('/companies', data),
  moderate: (id, status) => api.patch(`/companies/${id}/moderate`, { status }),
  invitePartner: (data) => api.post('/companies/invite', data),
};

export const reviewService = {
  getByCompany: (companyId, params) => api.get(`/companies/${companyId}/reviews`, { params }),
  create: (companyId, data) => api.post(`/companies/${companyId}/reviews`, data),
  like: (id) => api.post(`/reviews/${id}/like`),
  flag: (id) => api.post(`/reviews/${id}/flag`),
  moderate: (id, status) => api.patch(`/reviews/${id}/moderate`, { status }),
};

export const offerService = {
  getAll: (params) => api.get('/offers', { params }),
  getOne: (id) => api.get(`/offers/${id}`),
  getMyApplications: () => api.get('/offers/applications/me'),
  getCompanyApplicants: (params) => api.get('/offers/company/applicants', { params }),
  updateCompanyApplicationStatus: (id, data) => api.patch(`/offers/company/applications/${id}/status`, data),
  apply: (id, data) => api.post(`/offers/${id}/apply`, data),
  updateApplication: (id, data) => api.patch(`/offers/applications/${id}`, data),
  create: (data) => api.post('/offers', data),
};

export const dashboardService = {
  get: () => api.get('/dashboard'),
  getSuperAdmin: () => api.get('/dashboard/superadmin'),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  setActiveStatus: (id, isActive) => api.patch(`/users/${id}/suspend`, { isActive }),
  updateMe: (data) => api.patch('/users/me', data),
  uploadAvatar: (formData) => api.patch('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  downloadProfilePdf: () => api.get('/users/me/profile-pdf', { responseType: 'blob' }),
};

export const schoolService = {
  importStudents: (schoolId, formData) => api.post(`/schools/${schoolId}/import-students`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  inviteStudent: (schoolId, data) => api.post(`/schools/${schoolId}/invite-student`, data),
};
