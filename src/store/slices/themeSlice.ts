import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
}

const THEME_KEY = 'theme';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  return 'light';
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_KEY, action.payload);
      }
      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(state.theme);
    },
    toggleTheme: (state) => {
      const newTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
      state.theme = newTheme;
      if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_KEY, newTheme);
      }
      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(state.theme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;