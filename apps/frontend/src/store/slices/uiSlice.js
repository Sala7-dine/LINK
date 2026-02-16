import { createSlice } from '@reduxjs/toolkit';

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    darkMode: localStorage.getItem('link_dark_mode')
      ? localStorage.getItem('link_dark_mode') === 'true'
      : prefersDark,
    sidebarOpen: true,
  },
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('link_dark_mode', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { toggleDarkMode, toggleSidebar } = uiSlice.actions;
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;

export default uiSlice.reducer;
