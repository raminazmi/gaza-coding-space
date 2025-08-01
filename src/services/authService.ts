import { apiBaseUrl } from '@/lib/utils';
import { getStoredToken } from '@/store/slices/authSlice';
import apiMonitor from '@/utils/apiMonitor';

export interface AuthResponse {
  success: boolean;
  data?: any;
  message?: string;
  errors?: any;
}

// Cache interface
interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Cache service for API responses
class ApiCache {
  private cache = new Map<string, CacheItem>()
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>()
  private pendingRequests = new Map<string, Promise<any>>()

  // Enhanced rate limiting with exponential backoff
  private async checkRateLimit(endpoint: string): Promise<boolean> {
    const now = Date.now()
    const limit = this.rateLimitMap.get(endpoint)
    
    if (!limit || now > limit.resetTime) {
      this.rateLimitMap.set(endpoint, { count: 1, resetTime: now + 60000 }) // 1 minute window
      return true
    }
    
    if (limit.count >= 10) { // Max 10 requests per minute
      return false
    }
    
    limit.count++
    return true
  }

  // Enhanced caching with intelligent TTL
  private getCacheKey(endpoint: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `${endpoint}${paramString}`
  }

  private getTTL(endpoint: string): number {
    // Different TTL based on endpoint type
    if (endpoint.includes('course-details')) {
      return 15 * 60 * 1000 // 15 minutes for course details
    }
    if (endpoint.includes('user') || endpoint.includes('profile')) {
      return 5 * 60 * 1000 // 5 minutes for user data
    }
    if (endpoint.includes('notifications')) {
      return 30 * 1000 // 30 seconds for notifications
    }
    return 2 * 60 * 1000 // Default 2 minutes
  }

  async executeWithCache(
    endpoint: string,
    fetchFn: () => Promise<any>,
    params?: any,
    customTTL?: number
  ): Promise<any> {
    const cacheKey = this.getCacheKey(endpoint, params)
    const ttl = customTTL || this.getTTL(endpoint)
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      console.log(`🔄 Request already pending for: ${endpoint}`)
      return this.pendingRequests.get(cacheKey)
    }
    
    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`📦 Cache hit for: ${endpoint}`)
      return cached.data
    }
    
    // Check rate limit
    if (!(await this.checkRateLimit(endpoint))) {
      console.log(`⏳ Rate limit exceeded for: ${endpoint}, using cached data if available`)
      if (cached) {
        return cached.data
      }
      throw new Error('Rate limit exceeded and no cached data available')
    }
    
    // Create pending request
    const requestPromise = (async () => {
      try {
        console.log(`🌐 Fetching fresh data for: ${endpoint}`)
        const data = await fetchFn()
        
          // Cache the result
         this.cache.set(cacheKey, {
           data,
           timestamp: Date.now(),
           ttl: ttl
         })
        
        return data
      } finally {
        this.pendingRequests.delete(cacheKey)
      }
    })()
    
    this.pendingRequests.set(cacheKey, requestPromise)
    return requestPromise
  }

  // Enhanced course details caching with intelligent refresh
  async getCourseDetails(courseId: string, fetchFn: () => Promise<any>): Promise<any> {
    const endpoint = `/api/course-details/${courseId}`;
    const authEndpoint = `/api/course-detailsAuth/${courseId}`;
    
    // Use longer TTL for course details (15 minutes)
    const ttl = 15 * 60 * 1000;
    
    // Add exponential backoff for failed requests
    const executeWithRetry = async (attempt = 1): Promise<any> => {
      try {
        return await this.executeWithCache(
          endpoint,
          fetchFn,
          { courseId },
          ttl
        );
      } catch (error: any) {
        if (error.message.includes('429') && attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`⏰ Rate limited, retrying in ${delay}ms (attempt ${attempt})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return executeWithRetry(attempt + 1);
        }
        throw error;
      }
    };
    
    return executeWithRetry();
  }

  // Clear cache for specific endpoint
  clearCache(endpoint?: string): void {
    if (endpoint) {
      for (const key of this.cache.keys()) {
        if (key.includes(endpoint)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    this.rateLimitMap.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

class AuthService {
  private baseURL = apiBaseUrl;
  private tokenCache: string | null = null;
  private tokenExpiryCache: number | null = null;
  private apiCache = new ApiCache();

  getToken(): string | null {
    // Use cache if available and not expired
    if (this.tokenCache && this.tokenExpiryCache && Date.now() < this.tokenExpiryCache) {
      return this.tokenCache;
    }

    const token = getStoredToken();
    
    // Cache the token
    if (token) {
      this.tokenCache = token;
      this.tokenExpiryCache = Date.now() + (24 * 60 * 60 * 1000); // Assume 24 hours
    }
    
    return token;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // دالة جديدة للتحقق من حالة الـ authentication مع Redux
  isAuthenticatedWithRedux(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // التحقق من أن الـ token صالح
    try {
      // يمكن إضافة المزيد من التحقق هنا إذا لزم الأمر
      return true;
    } catch {
      return false;
    }
  }

  // Clear token cache
  clearTokenCache(): void {
    this.tokenCache = null;
    this.tokenExpiryCache = null;
  }

  // Update token cache
  updateTokenCache(token: string, expiry?: number): void {
    this.tokenCache = token;
    this.tokenExpiryCache = expiry || (Date.now() + (24 * 60 * 60 * 1000));
  }

  // Clear API cache
  clearApiCache(): void {
    this.apiCache.clearCache();
  }

  // Invalidate specific cache patterns
  invalidateCache(pattern: string): void {
    this.apiCache.clearCache(pattern);
  }

  private getAuthHeaders(includeContentType: boolean = true): HeadersInit {
    const headers: HeadersInit = {};

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }

    // إضافة headers للـ CORS
    headers['Accept'] = 'application/json';
    headers['X-Requested-With'] = 'XMLHttpRequest';

    return headers;
  }

  private getFormDataHeaders(): HeadersInit {
    const headers: HeadersInit = {};

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // للـ FormData لا نضع Content-Type
    headers['Accept'] = 'application/json';
    headers['X-Requested-With'] = 'XMLHttpRequest';

    return headers;
  }

  async apiCall(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<AuthResponse> {
    const startTime = Date.now();
    
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const isFormData = options.body instanceof FormData;
      let headers: HeadersInit;

      if (requireAuth) {
        headers = isFormData ? this.getFormDataHeaders() : this.getAuthHeaders();
      } else {
        headers = isFormData 
          ? { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' }
          : { 'Content-Type': 'application/json', 'Accept': 'application/json' };
      }

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);

      let data: any;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      const responseTime = Date.now() - startTime;
      const success = response.ok;

      // Log the API call for monitoring
      apiMonitor.logRequest(endpoint, success, responseTime);

      if (!response.ok) {
        if (data.errors) {
          Object.entries(data.errors).forEach(([field, messages]: [string, any]) => {
          });
        }

        return {
          success: false,
          message: data.message || `HTTP ${response.status}`,
          errors: data.errors,
        };
      }

      return {
        success: true,
        data,
        message: data.message,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      apiMonitor.logRequest(endpoint, false, responseTime);
      
      return {
        success: false,
        message: error.message || 'حدث خطأ في الشبكة',
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
    
    // Update cache if login successful
    if (response.success && response.data?.token) {
      this.updateTokenCache(response.data.token);
    }
    
    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<AuthResponse> {
    return this.apiCall('/api/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }, false);
  }

  async getCurrentUser(): Promise<AuthResponse> {
    return this.apiCall('/api/user');
  }

  async logout(): Promise<AuthResponse> {
    const response = await this.apiCall('/api/logout', { method: 'POST' });
    
    // Clear cache on logout
    this.clearTokenCache();
    this.clearApiCache();
    
    return response;
  }

  async verifyEmail(code: string): Promise<AuthResponse> {
    return this.apiCall('/api/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async verifyLoginCode(email: string, loginCode: string): Promise<AuthResponse> {
    return this.apiCall('/api/login/verify', {
      method: 'POST',
      body: JSON.stringify({
        email,
        login_code: loginCode
      }),
    }, false);
  }

  async getCourseDetails(courseId: string): Promise<AuthResponse> {
    const isAuth = this.isAuthenticated();
    const endpoint = isAuth
      ? `/api/course-detailsAuth/${courseId}`
      : `/api/course-details/${courseId}`;

    // Use cached version with rate limiting
    const fetchCourseDetails = async () => {
      return this.apiCall(endpoint, {}, isAuth);
    };

    try {
      const result = await this.apiCache.getCourseDetails(courseId, fetchCourseDetails);
      return result;
    } catch (error: any) {
      // Fallback to direct API call if cache fails
      return this.apiCall(endpoint, {}, isAuth);
    }
  }

  async checkEnrollment(courseId: string): Promise<AuthResponse> {
    const result = await this.apiCall(`/api/check-enroll/${courseId}`);

    if (!result.success && result.message && result.message.includes('<!DOCTYPE html>')) {
      const alternativeEndpoints = [
        `/api/enrollment-status/${courseId}`,
        `/api/enroll/check/${courseId}`
      ];

      for (const endpoint of alternativeEndpoints) {
        try {
          const altResult = await this.apiCall(endpoint);
          if (altResult.success || !altResult.message?.includes('<!DOCTYPE html>')) {
            return altResult;
          }
        } catch (error) {
          continue;
        }
      }
    }

    return result;
  }

  async enrollInCourse(courseId: string): Promise<AuthResponse> {
    const response = await this.apiCall('/api/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });

          // Invalidate course details cache after enrollment
      if (response.success) {
        this.apiCache.clearCache(`course-details`);
      }

    return response;
  }

  async toggleFavorite(courseId: string): Promise<AuthResponse> {
    const response = await this.apiCall(`/api/toggle-favorite/${courseId}`, {
      method: 'POST',
    });

          // Invalidate course details cache after favorite toggle
      if (response.success) {
        this.apiCache.clearCache(`course-details`);
      }

    return response;
  }

  async getLectureDetails(courseId: string, lectureId: string): Promise<AuthResponse> {
    return this.apiCall(`/api/LectureDetails/${courseId}/${lectureId}`, {}, this.isAuthenticated());
  }

  async showLecture(courseId: string, lectureId: string): Promise<AuthResponse> {
    return this.apiCall(`/api/showLecture/${courseId}/${lectureId}`, {}, this.isAuthenticated());
  }

  async markLectureWatched(lectureId: string, courseId: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('lecture_id', lectureId);
    formData.append('course_id', courseId);
    formData.append('status', 'endWatch');

    return this.apiCall('/api/watch-Lecture', {
      method: 'POST',
      body: formData,
    });
  }

  async getDiscussions(courseId: string, lectureId: string): Promise<AuthResponse> {
    return this.apiCall(`/api/discussions/${courseId}/${lectureId}`, {}, this.isAuthenticated());
  }

  async postDiscussion(data: {
    description: string;
    course_id: string;
    teacher_id: string;
    lecture_id: string;
  }): Promise<AuthResponse> {    
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    return this.apiCall('/api/post-discussion', {
      method: 'POST',
      body: formData,
    });
  }

  async sendMessage(conversationId: string, message: string): Promise<AuthResponse> {    
    const formData = new FormData();
    formData.append('conversation_id', String(conversationId));
    formData.append('message', String(message));

    return this.apiCall('/api/messages', {
      method: 'POST',
      body: formData,
    });
  }

  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = this.getAuthHeaders();

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    return fetch(url, config);
  }
}

export const authService = new AuthService();
export default authService;