import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { apiBaseUrl } from '@/lib/utils';

// تشفير بسيط للـ token (يمكن تحسينه أكثر)
const encryptToken = (token: string): string => {
  return btoa(token + 'gaza-coding-space-salt');
};

const decryptToken = (encryptedToken: string): string => {
  try {
    const decoded = atob(encryptedToken);
    return decoded.replace('gaza-coding-space-salt', '');
  } catch {
    return '';
  }
};

interface AuthState {
  isAuthenticated: boolean;
  user: null | {
    id: number;
    name: string;
    email: string;
    profile_photo_url?: string;
    [key: string]: any;
  };
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt: number | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.token && data.user) {
        const tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        
        // حفظ مشفر في sessionStorage (أكثر أماناً من localStorage)
        sessionStorage.setItem('auth_token', encryptToken(data.token));
        sessionStorage.setItem('token_expiry', tokenExpiry.toString());
        
        return {
          user: data.user,
          accessToken: data.token,
          refreshToken: data.refresh_token || null,
          tokenExpiry,
        };
      }
      
      throw new Error(data.message || 'فشل في تسجيل الدخول');
    } catch (error: any) {
      dispatch(incrementLoginAttempts());
      return rejectWithValue(error.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { 
    name: string; 
    email: string; 
    password: string;
    password_confirmation: string;
  }, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setLoading(true));
      
      const response = await fetch(`${apiBaseUrl}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'حدث خطأ أثناء التسجيل');
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as any;
      const token = state.auth.accessToken || getStoredToken();
      
      if (!token) {
        throw new Error('لا يوجد token');
      }

      const response = await fetch(`${apiBaseUrl}/api/student`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          dispatch(logout());
          throw new Error('انتهت صلاحية الجلسة');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data && (data.id || data.email)) {
        return data;
      }
      
      throw new Error('بيانات المستخدم غير صالحة');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue, dispatch }) => {
    try {
      const state = getState() as any;
      const refreshToken = state.auth.refreshToken;
      
      if (!refreshToken) {
        throw new Error('لا يوجد refresh token');
      }

      const response = await fetch(`${apiBaseUrl}/api/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        dispatch(logout());
        throw new Error('فشل في تجديد الجلسة');
      }

      const data = await response.json();
      
      if (data.token) {
        const tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
        sessionStorage.setItem('auth_token', encryptToken(data.token));
        sessionStorage.setItem('token_expiry', tokenExpiry.toString());
        
        return {
          accessToken: data.token,
          tokenExpiry,
        };
      }
      
      throw new Error('فشل في الحصول على token جديد');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to get stored token
export const getStoredToken = (): string | null => {
  try {
    // Try sessionStorage first (new method)
    let encryptedToken = sessionStorage.getItem('auth_token');
    let expiry = sessionStorage.getItem('token_expiry');
    
    // Fallback to localStorage for backward compatibility
    if (!encryptedToken) {
      const plainToken = localStorage.getItem('token');
      if (plainToken) {
        return plainToken; // Return plain token from localStorage
      }
      return null;
    }
    
    if (!expiry) return null;
    
    if (Date.now() > parseInt(expiry)) {
      // Token expired
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('token_expiry');
      return null;
    }
    
    return decryptToken(encryptedToken);
  } catch {
    // Fallback to localStorage if sessionStorage fails
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.tokenExpiry = null;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
      
      // Clear stored data
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('token_expiry');
      localStorage.removeItem('token'); // Clear old localStorage token
    },
    incrementLoginAttempts: (state) => {
      state.loginAttempts += 1;
      state.lastLoginAttempt = Date.now();
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    updateUser: (state, action: PayloadAction<any>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    // Action للحفاظ على التوافق مع الكود القديم
    loginSuccess: (state, action: PayloadAction<{ user: any; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.tokenExpiry = Date.now() + (24 * 60 * 60 * 1000);
      state.error = null;
      state.loginAttempts = 0;
      
      // حفظ مشفر
      sessionStorage.setItem('auth_token', encryptToken(action.payload.token));
      sessionStorage.setItem('token_expiry', state.tokenExpiry.toString());
    },
    // التحقق من الـ token المحفوظ عند تحميل التطبيق
    initializeAuth: (state) => {
      const token = getStoredToken();
      if (token) {
        state.accessToken = token;
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiry = action.payload.tokenExpiry;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
        
        // Register device token after successful authentication
        import('@/firebase').then(({ registerDeviceToken }) => {
          registerDeviceToken().catch(console.error);
        }).catch(console.error);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch user cases
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })
      
      // Refresh token cases
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.tokenExpiry = action.payload.tokenExpiry;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiry = null;
      });
  },
});

export const {
  setLoading,
  clearError,
  logout,
  incrementLoginAttempts,
  resetLoginAttempts,
  updateUser,
  loginSuccess,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;