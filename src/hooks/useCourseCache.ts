import { useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '@/services/authService';

interface CourseCacheItem {
  data: any;
  timestamp: number;
  ttl: number;
  loading: boolean;
  error: string | null;
}

interface UseCourseCacheReturn {
  course: any;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

// Global cache for course data
const courseCache = new Map<string, CourseCacheItem>();

// Cache TTL in milliseconds (15 minutes)
const CACHE_TTL = 15 * 60 * 1000;

export const useCourseCache = (courseId: string | undefined): UseCourseCacheReturn => {
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback((id: string) => {
    const isAuth = authService.isAuthenticated();
    return `course-${id}-${isAuth}`;
  }, []);

  const isCacheValid = useCallback((cacheItem: CourseCacheItem): boolean => {
    return Date.now() - cacheItem.timestamp < cacheItem.ttl;
  }, []);

  const loadCourseData = useCallback(async (id: string, forceRefresh = false) => {
    if (!id) return;

    const cacheKey = getCacheKey(id);
    const cached = courseCache.get(cacheKey);

    // Use cached data if valid and not forcing refresh
    if (!forceRefresh && cached && isCacheValid(cached)) {
      console.log('📦 Using cached course data for:', id);
      setCourse(cached.data);
      setLoading(false);
      setError(null);
      return;
    }

    // If already loading, don't start another request
    if (cached?.loading) {
      console.log('🔄 Course data already loading for:', id);
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    // Update cache with loading state
    courseCache.set(cacheKey, {
      data: cached?.data || null,
      timestamp: Date.now(),
      ttl: CACHE_TTL,
      loading: true,
      error: null
    });

    try {
      console.log('🌐 Fetching fresh course data for:', id);
      
      const result = await authService.getCourseDetails(id);

      if (result.success && result.data) {
        const courseData = result.data;

        // Update cache with fresh data
        courseCache.set(cacheKey, {
          data: courseData,
          timestamp: Date.now(),
          ttl: CACHE_TTL,
          loading: false,
          error: null
        });

        setCourse(courseData);
        setError(null);
      } else {
        const errorMessage = result.message || 'حدث خطأ في تحميل بيانات الدورة';
        
        // Update cache with error state
        courseCache.set(cacheKey, {
          data: cached?.data || null,
          timestamp: Date.now(),
          ttl: CACHE_TTL,
          loading: false,
          error: errorMessage
        });

        setError(errorMessage);
      }
    } catch (error: any) {
      console.error('Error loading course data:', error);
      
      const errorMessage = error.message || 'حدث خطأ في تحميل بيانات الدورة';
      
      // Update cache with error state
      courseCache.set(cacheKey, {
        data: cached?.data || null,
        timestamp: Date.now(),
        ttl: CACHE_TTL,
        loading: false,
        error: errorMessage
      });

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getCacheKey, isCacheValid]);

  const refresh = useCallback(async () => {
    if (courseId) {
      await loadCourseData(courseId, true);
    }
  }, [courseId, loadCourseData]);

  const clearCache = useCallback(() => {
    if (courseId) {
      const cacheKey = getCacheKey(courseId);
      courseCache.delete(cacheKey);
      console.log('🗑️ Cleared cache for course:', courseId);
    }
  }, [courseId, getCacheKey]);

  // Load data on mount and when courseId changes
  useEffect(() => {
    if (courseId) {
      loadCourseData(courseId);
    }

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [courseId, loadCourseData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    course,
    loading,
    error,
    refresh,
    clearCache
  };
};

// Utility function to clear all course cache
export const clearAllCourseCache = () => {
  courseCache.clear();
  console.log('🗑️ Cleared all course cache');
};

// Utility function to get cache statistics
export const getCourseCacheStats = () => {
  const stats = {
    size: courseCache.size,
    keys: Array.from(courseCache.keys()),
    items: Array.from(courseCache.entries()).map(([key, item]) => ({
      key,
      timestamp: item.timestamp,
      loading: item.loading,
      hasError: !!item.error,
      isValid: Date.now() - item.timestamp < item.ttl
    }))
  };
  
  console.log('📊 Course cache statistics:', stats);
  return stats;
}; 