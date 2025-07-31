// Utility function to quickly replace localStorage token usage

import { getStoredToken } from '@/store/slices/authSlice';

// Updated way to get token - use this instead of localStorage.getItem('token')
export const getAuthToken = (): string | null => {
  return getStoredToken();
};

// Helper to replace fetch calls that use localStorage
export const createAuthenticatedFetch = (authService: any) => {
  return async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  };
};

// Quick replacement patterns:
// 
// OLD: const token = localStorage.getItem('token');
// NEW: const token = getAuthToken();
//
// OLD: headers: token ? { Authorization: `Bearer ${token}` } : {}
// NEW: headers: authService.getAuthHeaders()
//
// OLD: const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
// NEW: const response = await authService.fetchWithAuth(url);
//
// OLD: const result = await fetch('/api/endpoint', { method: 'POST', body: data });
// NEW: const result = await authService.apiCall('/api/endpoint', { method: 'POST', body: data });

export default {
  getAuthToken,
  createAuthenticatedFetch,
};