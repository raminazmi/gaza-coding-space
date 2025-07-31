import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiBaseUrl } from '@/lib/utils';

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

export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      // Get token from auth state instead of localStorage
      const state = getState() as any;
      const token = state.auth?.accessToken;
      
      if (!token) throw new Error('No token');
      const res = await fetch(`${apiBaseUrl}/api/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentType = res.headers.get('content-type');
      let rawResponse = await res.clone().text();
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('الاستجابة ليست JSON (غالباً تم إرجاع صفحة HTML أو حدث خطأ في السيرفر)');
      }
      const data = await res.json();
      if (data && (data.id || data.email)) {
        dispatch(setUser(data));
        return data;
      } else {
        throw new Error('بيانات المستخدم غير صالحة');
      }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export default userSlice.reducer; 