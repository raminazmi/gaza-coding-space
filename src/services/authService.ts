import { apiBaseUrl } from '@/lib/utils';
import { getStoredToken } from '@/store/slices/authSlice';

export interface AuthResponse {
  success: boolean;
  data?: any;
  message?: string;
  errors?: any;
}

class AuthService {
  private baseURL = apiBaseUrl;

  // Get current token
  getToken(): string | null {
    return getStoredToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Create headers with authentication
  private getAuthHeaders(includeContentType: boolean = true): HeadersInit {
    const headers: HeadersInit = {};
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }

  // Generic API call with automatic token handling
  async apiCall(
    endpoint: string, 
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<AuthResponse> {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      
      const headers = requireAuth ? this.getAuthHeaders() : { 'Content-Type': 'application/json' };
      
      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };



      const response = await fetch(url, config);
      

      
      // Handle different response types
      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }



      if (!response.ok) {
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
      return {
        success: false,
        message: error.message || 'حدث خطأ في الشبكة',
      };
    }
  }

  // Login user
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
  }

  // Register user
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

  // Get current user data
  async getCurrentUser(): Promise<AuthResponse> {
    return this.apiCall('/api/student');
  }

  // Logout user
  async logout(): Promise<AuthResponse> {
    return this.apiCall('/api/logout', {
      method: 'DELETE',
    });
  }

  // Verify email
  async verifyEmail(code: string): Promise<AuthResponse> {
    return this.apiCall('/api/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Verify login code (specific for this app)
  async verifyLoginCode(email: string, loginCode: string): Promise<AuthResponse> {
    return this.apiCall('/api/login/verify', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        login_code: loginCode 
      }),
    }, false);
  }

  // Course operations
  async getCourseDetails(courseId: string): Promise<AuthResponse> {
    const endpoint = this.isAuthenticated() 
      ? `/api/course-detailsAuth/${courseId}` 
      : `/api/course-details/${courseId}`;
    
    return this.apiCall(endpoint, {}, this.isAuthenticated());
  }

  async checkEnrollment(courseId: string): Promise<AuthResponse> {
    // Try primary endpoint first
    const result = await this.apiCall(`/api/check-enroll/${courseId}`);
    
    // If we get HTML response, it means endpoint doesn't exist, try alternatives
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
    return this.apiCall('/api/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  }

  async toggleFavorite(courseId: string): Promise<AuthResponse> {
    return this.apiCall(`/api/toggle-favorite/${courseId}`, {
      method: 'POST',
    });
  }

  // Lecture operations
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

  // Discussion operations
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
      formData.append(key, value);
    });

    return this.apiCall('/api/post-discussion', {
      method: 'POST',
      body: formData,
    });
  }

  async sendMessage(conversationId: string, message: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('conversation_id', conversationId);
    formData.append('message', message);

    return this.apiCall('/api/messages', {
      method: 'POST',
      body: formData,
    });
  }

  // Generic authenticated fetch (for backward compatibility)
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

// Export singleton instance
export const authService = new AuthService();
export default authService;