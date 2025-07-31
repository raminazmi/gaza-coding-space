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

  getToken(): string | null {
    return getStoredToken();
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
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
      return {
        success: false,
        message: error.message || 'حدث خطأ في الشبكة',
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.apiCall('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, false);
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
    return this.apiCall('/api/student');
  }

  async logout(): Promise<AuthResponse> {
    return this.apiCall('/api/logout', {
      method: 'DELETE',
    });
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
    const endpoint = this.isAuthenticated()
      ? `/api/course-detailsAuth/${courseId}`
      : `/api/course-details/${courseId}`;

    return this.apiCall(endpoint, {}, this.isAuthenticated());
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