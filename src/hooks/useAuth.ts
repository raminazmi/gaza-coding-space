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
import { useCallback, useEffect, useRef } from 'react';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const initializedRef = useRef(false);
  const userFetchedRef = useRef(false);
  const syncRef = useRef(false);

  // Initialize auth only once on app start
  useEffect(() => {
    if (!initializedRef.current && !auth.initialized) {
      initializedRef.current = true;
      dispatch(initializeAuth());
    }
  }, [dispatch, auth.initialized]);

  // Fetch user data only once if authenticated and no user data
  useEffect(() => {
    if (auth.isAuthenticated && !auth.user && auth.accessToken && !userFetchedRef.current && !auth.isLoading) {
      userFetchedRef.current = true;
      dispatch(fetchCurrentUser());
    }
  }, [auth.isAuthenticated, auth.user, auth.accessToken, auth.isLoading, dispatch]);

  // Auto refresh token before expiry (only if not already refreshing)
  useEffect(() => {
    if (!auth.tokenExpiry || !auth.isAuthenticated || auth.isLoading) return;

    const timeUntilExpiry = auth.tokenExpiry - Date.now();
    const refreshTime = timeUntilExpiry - (5 * 60 * 1000); // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      const timer = setTimeout(() => {
        if (auth.refreshToken && !auth.isLoading) {
          dispatch(refreshAccessToken());
        }
      }, refreshTime);

      return () => clearTimeout(timer);
    }
  }, [auth.tokenExpiry, auth.isAuthenticated, auth.refreshToken, auth.isLoading, dispatch]);

  // Sync authentication state between authService and Redux (only when needed)
  useEffect(() => {
    if (syncRef.current || auth.isLoading) return;
    
    const token = authService.getToken();
    const serviceAuthenticated = !!token;
    const reduxAuthenticated = auth.isAuthenticated;
    
    // إذا كان هناك token في authService ولكن Redux يقول غير مسجل
    if (serviceAuthenticated && !reduxAuthenticated) {
      syncRef.current = true;
      dispatch(initializeAuth());
    }
    // إذا كان Redux يقول مسجل ولكن لا يوجد token في authService
    else if (!serviceAuthenticated && reduxAuthenticated) {
      syncRef.current = true;
      dispatch(logout());
    }
  }, [auth.isAuthenticated, auth.isLoading, dispatch]);

  const login = useCallback(async (email: string, password: string) => {
    userFetchedRef.current = false; // Reset user fetched flag
    syncRef.current = false; // Reset sync flag
    const result = await dispatch(loginUser({ email, password }));
    return result;
  }, [dispatch]);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    userFetchedRef.current = false; // Reset user fetched flag
    syncRef.current = false; // Reset sync flag
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
      console.error('Logout API error:', error);
    } finally {
      userFetchedRef.current = false; // Reset user fetched flag
      initializedRef.current = false; // Reset initialized flag
      syncRef.current = false; // Reset sync flag
      
      // Reset device token registration
      import('@/firebase').then(({ resetDeviceTokenRegistration }) => {
        resetDeviceTokenRegistration();
      }).catch(console.error);
      
      dispatch(logout());
    }
  }, [dispatch, auth.isAuthenticated]);

  const fetchUser = useCallback(() => {
    if (!userFetchedRef.current && !auth.isLoading) {
      userFetchedRef.current = true;
      return dispatch(fetchCurrentUser());
    }
    return Promise.resolve();
  }, [dispatch, auth.isLoading]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const refreshToken = useCallback(() => {
    return dispatch(refreshAccessToken());
  }, [dispatch]);

  // Get current token (cached)
  const getToken = useCallback(() => {
    return auth.accessToken || authService.getToken();
  }, [auth.accessToken]);

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

  // Optimized authentication check
  const isAuthenticated = useCallback(() => {
    return auth.isAuthenticated && !!getToken();
  }, [auth.isAuthenticated, getToken]);

  return {
    isAuthenticated: isAuthenticated(),
    user: auth.user,
    isLoading: auth.isLoading,
    error: auth.error,
    loginAttempts: auth.loginAttempts,
    tokenExpiry: auth.tokenExpiry,
    login,
    register,
    logout: logoutUser,
    fetchUser,
    clearError: clearAuthError,
    refreshToken,
    getToken,
    canAttemptLogin,
    getWaitTimeUntilNextAttempt,
    authService,
  };
};

export default useAuth;