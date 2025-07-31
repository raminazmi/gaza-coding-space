// مثال على كيفية استخدام النظام الجديد للAuth

import React, { useState } from 'react';
import useAuth from '@/hooks/useAuth';

const AuthUsageExample = () => {
  const { 
    isAuthenticated, 
    user, 
    login, 
    logout, 
    authService,
    isLoading,
    error 
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // مثال على تسجيل الدخول
  const handleLogin = async () => {
    try {
      const result = await login(email, password);
      if (result.type === 'auth/loginUser/fulfilled') {
        console.log('تم تسجيل الدخول بنجاح');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
    }
  };

  // مثال على استدعاء API محمي
  const fetchProtectedData = async () => {
    try {
      const result = await authService.apiCall('/api/protected-endpoint');
      if (result.success) {
        console.log('البيانات:', result.data);
      } else {
        console.error('خطأ:', result.message);
      }
    } catch (error) {
      console.error('خطأ في الشبكة:', error);
    }
  };

  // مثال على الحصول على بيانات الدورة
  const getCourseDetails = async (courseId: string) => {
    try {
      const result = await authService.getCourseDetails(courseId);
      if (result.success) {
        console.log('بيانات الدورة:', result.data);
        return result.data;
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات الدورة:', error);
    }
  };

  return (
    <div>
      <h2>مثال على استخدام النظام الجديد للAuth</h2>
      
      {isAuthenticated ? (
        <div>
          <p>مرحباً {user?.name}!</p>
          <button onClick={logout}>تسجيل الخروج</button>
          <button onClick={fetchProtectedData}>جلب البيانات المحمية</button>
        </div>
      ) : (
        <div>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
          />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
          />
          <button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </button>
        </div>
      )}

      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};

export default AuthUsageExample;