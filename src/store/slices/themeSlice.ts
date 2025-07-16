import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  systemTheme: 'light' | 'dark';
  effectiveTheme: 'light' | 'dark';
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const initialState: ThemeState = {
  theme: 'system',
  systemTheme: getSystemTheme(),
  effectiveTheme: getSystemTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      
      if (action.payload === 'system') {
        state.effectiveTheme = state.systemTheme;
      } else {
        state.effectiveTheme = action.payload;
      }
      
      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(state.effectiveTheme);
    },
    setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemTheme = action.payload;
      
      if (state.theme === 'system') {
        state.effectiveTheme = action.payload;
        
        // Apply theme to document
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(state.effectiveTheme);
      }
    },
    toggleTheme: (state) => {
      if (state.theme === 'light') {
        state.theme = 'dark';
        state.effectiveTheme = 'dark';
      } else if (state.theme === 'dark') {
        state.theme = 'system';
        state.effectiveTheme = state.systemTheme;
      } else {
        state.theme = 'light';
        state.effectiveTheme = 'light';
      }
      
      // Apply theme to document
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(state.effectiveTheme);
    },
  },
});

export const { setTheme, setSystemTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;