import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  isAuthenticated: boolean;
  user: null | {
    name: string;
    email: string;
    [key: string]: any;
  };
  token: string | null;
}

const initialState: UserState = {
  isAuthenticated: false,
  user: null,
  token: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: any; token: string }>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    updateUser(state, action: PayloadAction<any>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setUser(state, action: PayloadAction<any>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
  },
});

export const { loginSuccess, logout, updateUser, setUser } = userSlice.actions;
export default userSlice.reducer; 