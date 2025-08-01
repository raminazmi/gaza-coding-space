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

// Cache للـ token لتقليل القراءة من storage
let tokenCache: string | null = null;
let tokenExpiryCache: number | null = null;

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
  initialized: boolean; // إضافة flag للتأكد من التهيئة
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
  initialized: false,
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

// Helper function to get stored token with cache
export const getStoredToken = (): string | null => {
  try {
    // Use cache if available and not expired
    if (tokenCache && tokenExpiryCache && Date.now() < tokenExpiryCache) {
      return tokenCache;
    }

    // Try sessionStorage first (new method)
    let encryptedToken = sessionStorage.getItem('auth_token');
    let expiry = sessionStorage.getItem('token_expiry');
    
    // Fallback to localStorage for backward compatibility
    if (!encryptedToken) {
      const plainToken = localStorage.getItem('token');
      if (plainToken) {
        // Cache the plain token
        tokenCache = plainToken;
        tokenExpiryCache = Date.now() + (24 * 60 * 60 * 1000); // Assume 24 hours
        return plainToken;
      }
      return null;
    }
    
    if (!expiry) return null;
    
    const expiryTime = parseInt(expiry);
    if (Date.now() > expiryTime) {
      // Token expired
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('token_expiry');
      tokenCache = null;
      tokenExpiryCache = null;
      return null;
    }
    
    const decryptedToken = decryptToken(encryptedToken);
    
    // Cache the token
    tokenCache = decryptedToken;
    tokenExpiryCache = expiryTime;
    
    return decryptedToken;
  } catch {
    // Fallback to localStorage if sessionStorage fails
    try {
      const plainToken = localStorage.getItem('token');
      if (plainToken) {
        tokenCache = plainToken;
        tokenExpiryCache = Date.now() + (24 * 60 * 60 * 1000);
        return plainToken;
      }
      return null;
    } catch {
      return null;
    }
  }
};

// Function to clear token cache
export const clearTokenCache = () => {
  tokenCache = null;
  tokenExpiryCache = null;
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
      state.initialized = true;
      
      // Clear stored data
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('token_expiry');
      localStorage.removeItem('token'); // Clear old localStorage token
      
      // Clear cache
      clearTokenCache();
      
      // Reset device token registration
      import('@/firebase').then(({ resetDeviceTokenRegistration }) => {
        resetDeviceTokenRegistration();
      }).catch(console.error);
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
      state.initialized = true;
      
      // حفظ مشفر
      sessionStorage.setItem('auth_token', encryptToken(action.payload.token));
      sessionStorage.setItem('token_expiry', state.tokenExpiry.toString());
      
      // Update cache
      tokenCache = action.payload.token;
      tokenExpiryCache = state.tokenExpiry;
    },
    // التحقق من الـ token المحفوظ عند تحميل التطبيق
    initializeAuth: (state) => {
      if (state.initialized) return; // لا تتهيأ مرة أخرى
      
      const token = getStoredToken();
      if (token) {
        state.accessToken = token;
        state.isAuthenticated = true;
        state.initialized = true;
        // لا نجلب بيانات المستخدم هنا لأنها ستجلب في useEffect في useAuth
      } else {
        state.initialized = true;
      }
    },
    resetDeviceTokenRegistration: (state) => {
      state.initialized = false; // Reset the flag to force re-registration
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
        state.initialized = true;
        
        // Update cache
        tokenCache = action.payload.accessToken;
        tokenExpiryCache = action.payload.tokenExpiry;
        
        // Register device token after successful authentication
        import('@/firebase').then(({ registerDeviceToken }) => {
          registerDeviceToken().catch(console.error);
        }).catch(console.error);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        
        // Clear cache on login failure
        clearTokenCache();
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
        
        // Clear cache on register failure
        clearTokenCache();
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
        
        // Clear cache on fetch user failure
        clearTokenCache();
      })
      
      // Refresh token cases
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.tokenExpiry = action.payload.tokenExpiry;
        
        // Update cache
        tokenCache = action.payload.accessToken;
        tokenExpiryCache = action.payload.tokenExpiry;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.tokenExpiry = null;
        
        // Clear cache
        clearTokenCache();
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
  resetDeviceTokenRegistration,
} = authSlice.actions;

export default authSlice.reducer;