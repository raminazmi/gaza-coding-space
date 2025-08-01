import { useCallback, useEffect, useRef } from 'react';
import { authService } from '@/services/authService';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  key?: string; // Custom cache key
}

export const useApiCache = () => {
  const cacheTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear all cache
  const clearCache = useCallback(() => {
    authService.clearApiCache();
  }, []);

  // Invalidate specific cache patterns
  const invalidateCache = useCallback((pattern: string) => {
    authService.invalidateCache(pattern);
  }, []);

  // Invalidate course details cache
  const invalidateCourseCache = useCallback((courseId?: string) => {
    if (courseId) {
      authService.invalidateCache(`course-details/${courseId}`);
    } else {
      authService.invalidateCache('course-details');
    }
  }, []);

  // Invalidate user-related cache
  const invalidateUserCache = useCallback(() => {
    authService.invalidateCache('user');
    authService.invalidateCache('enroll');
  }, []);

  // Set up automatic cache cleanup on component unmount
  useEffect(() => {
    return () => {
      if (cacheTimeoutRef.current) {
        clearTimeout(cacheTimeoutRef.current);
      }
    };
  }, []);

  // Debounced cache invalidation to prevent rapid successive calls
  const debouncedInvalidate = useCallback((pattern: string, delay: number = 1000) => {
    if (cacheTimeoutRef.current) {
      clearTimeout(cacheTimeoutRef.current);
    }

    cacheTimeoutRef.current = setTimeout(() => {
      invalidateCache(pattern);
    }, delay);
  }, [invalidateCache]);

  return {
    clearCache,
    invalidateCache,
    invalidateCourseCache,
    invalidateUserCache,
    debouncedInvalidate,
  };
};

export default useApiCache; 