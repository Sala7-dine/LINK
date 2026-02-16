import axios from 'axios';
import { store } from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = store.getState().auth.refreshToken;
        const { data } = await axios.post('/api/v1/auth/refresh', { token: refreshToken });
        store.dispatch(setCredentials({ ...data.data, user: store.getState().auth.user }));
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default api;
