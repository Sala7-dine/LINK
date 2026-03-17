import { createSlice } from '@reduxjs/toolkit';

const tokenKey = 'link_access_token';
const refreshKey = 'link_refresh_token';
const userKey = 'link_user';

const initialState = {
  user: localStorage.getItem(userKey) ? JSON.parse(localStorage.getItem(userKey)) : null,
  accessToken: localStorage.getItem(tokenKey) || null,
  refreshToken: localStorage.getItem(refreshKey) || null,
  isAuthenticated: !!localStorage.getItem(tokenKey),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, { payload }) {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.isAuthenticated = true;
      localStorage.setItem(tokenKey, payload.accessToken);
      localStorage.setItem(refreshKey, payload.refreshToken);
      if (payload.user) localStorage.setItem(userKey, JSON.stringify(payload.user));
    },
    setUser(state, { payload }) {
      state.user = payload;
      if (payload) localStorage.setItem(userKey, JSON.stringify(payload));
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(refreshKey);
      localStorage.removeItem(userKey);
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAccessToken = (state) => state.auth.accessToken;

export default authSlice.reducer;
