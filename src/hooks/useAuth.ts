import { useAppDispatch, useAppSelector } from '@/hooks';
import { 
  loginUser, 
  registerUser, 
  fetchCurrentUser, 
  logout, 
  clearError,
  initializeAuth,
  refreshAccessToken
} from '@/store/slices/authSlice';
import { authService } from '@/services/authService';
import { useCallback, useEffect } from 'react';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);

  // Initialize auth on app start
  useEffect(() => {
    dispatch(initializeAuth());
    if (auth.isAuthenticated && !auth.user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  // Initialize Firebase device token if authenticated
  useEffect(() => {
    if (auth.isAuthenticated && auth.accessToken) {
      // Register device token for push notifications
      import('@/firebase').then(({ registerDeviceToken }) => {
        registerDeviceToken().catch(console.error);
      }).catch(console.error);
    }
  }, [auth.isAuthenticated, auth.accessToken]);

  // Auto refresh token before expiry
  useEffect(() => {
    if (!auth.tokenExpiry || !auth.isAuthenticated) return;

    const timeUntilExpiry = auth.tokenExpiry - Date.now();
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        if (auth.refreshToken) {
          dispatch(refreshAccessToken());
        }
      }, refreshTime);

      return () => clearTimeout(timer);
    }
  }, [auth.tokenExpiry, auth.isAuthenticated, auth.refreshToken, dispatch]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    return result;
  }, [dispatch]);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    const result = await dispatch(registerUser(userData));
    return result;
  }, [dispatch]);

  const logoutUser = useCallback(async () => {
    try {
      // Call logout API if authenticated
      if (auth.isAuthenticated) {
        await authService.logout();
      }
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      dispatch(logout());
    }
  }, [dispatch, auth.isAuthenticated]);

  const fetchUser = useCallback(() => {
    return dispatch(fetchCurrentUser());
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshToken = useCallback(() => {
    return dispatch(refreshAccessToken());
  }, [dispatch]);

  // Get current token
  const getToken = useCallback(() => {
    return authService.getToken();
  }, []);

  // Check if user can perform action (rate limiting)
  const canAttemptLogin = useCallback(() => {
    if (auth.loginAttempts >= 5) {
      const timeSinceLastAttempt = Date.now() - (auth.lastLoginAttempt || 0);
      const waitTime = 15 * 60 * 1000; // 15 minutes
      return timeSinceLastAttempt > waitTime;
    }
    return true;
  }, [auth.loginAttempts, auth.lastLoginAttempt]);

  const getWaitTimeUntilNextAttempt = useCallback(() => {
    if (auth.loginAttempts < 5) return 0;
    
    const timeSinceLastAttempt = Date.now() - (auth.lastLoginAttempt || 0);
    const waitTime = 15 * 60 * 1000; // 15 minutes
    const remainingTime = waitTime - timeSinceLastAttempt;
    
    return Math.max(0, remainingTime);
  }, [auth.loginAttempts, auth.lastLoginAttempt]);

  return {
    // State
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    isLoading: auth.isLoading,
    error: auth.error,
    loginAttempts: auth.loginAttempts,
    tokenExpiry: auth.tokenExpiry,
    
    // Actions
    login,
    register,
    logout: logoutUser,
    fetchUser,
    clearError: clearAuthError,
    refreshToken,
    getToken,
    
    // Utilities
    canAttemptLogin,
    getWaitTimeUntilNextAttempt,
    
    // Auth service (for direct API calls)
    authService,
  };
};

export default useAuth;