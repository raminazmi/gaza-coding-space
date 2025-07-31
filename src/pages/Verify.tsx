import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const CODE_LENGTH = 6;

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authService } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const email = location.state?.email || '';
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Handle input change
  const handleChange = (value: string, idx: number) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);
    if (value && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
    // تحقق تلقائي عند اكتمال الكود
    if (newCode.every((digit) => digit.length === 1)) {
      handleSubmitAuto(newCode.join(''));
    }
  };

  // Handle backspace
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      const newCode = [...code];
      newCode[idx - 1] = '';
      setCode(newCode);
      inputsRef.current[idx - 1]?.focus();
    }
  };

  // تحقق تلقائي عند اكتمال الكود
  const handleSubmitAuto = async (autoCode: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);



    try {
      const result = await authService.verifyLoginCode(email, autoCode);

      if (result.success && result.data) {
        // Extract token from different possible response formats
        let token: string | null = null;

        if (typeof result.data === 'string') {
          token = result.data;
        } else if (result.data?.token && typeof result.data.token === 'string') {
          token = result.data.token;
        } else if (result.data?.message && typeof result.data.message === 'string') {
          token = result.data.message;
        }

        if (token) {
          // Import store modules
          const { loginSuccess } = await import('@/store/slices/authSlice');
          const { store } = await import('@/store');

          // Save token using the new auth system (sessionStorage + encrypted)
          store.dispatch(loginSuccess({
            user: { name: email, email }, // temporary user data
            token
          }));

          // Fallback: also save to localStorage for compatibility
          localStorage.setItem('token', token);

          // Try to fetch actual user data
          try {
            const userResult = await authService.getCurrentUser();
            if (userResult.success && userResult.data) {
              store.dispatch(loginSuccess({
                user: userResult.data,
                token
              }));
            }
          } catch (userError) {
            // User data fetch failed, but we can continue with basic info
            console.warn('Failed to fetch user data:', userError);
          }

          // Register device token after successful authentication
          try {
            const { registerDeviceToken } = await import('@/firebase');
            await registerDeviceToken();
          } catch (error) {
            console.warn('Firebase device token registration failed:', error);
          }

          // Show success message and navigate
          toast({ title: 'تم التحقق بنجاح', description: 'تم تسجيل الدخول بنجاح' });

          // Navigate and reload to ensure clean authentication state
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 500); // Give time for toast to show
        } else {
          throw new Error('لم يتم الحصول على token');
        }
      } else {
        toast({
          title: 'خطأ',
          description: result.message || 'رمز التحقق غير صحيح',
          variant: 'destructive'
        });
        setCode(Array(CODE_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive'
      });
      setCode(Array(CODE_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  // إرسال يدوي عند الضغط على الزر
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.every((digit) => digit.length === 1)) {
      handleSubmitAuto(code.join(''));
    }
  };

  return (
    <div className="container min-h-screen py-16 bg-gray-100 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">تحقق من بريدك الإلكتروني</h1>
          <p className="text-base md:text-lg text-gray-500">يرجى إدخال كود التحقق المرسل إلى بريدك الإلكتروني</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex justify-center gap-2 flex-row-reverse flex-nowrap" dir="rtl">
            {code.map((digit, idx) => (
              <Input
                key={idx}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e.target.value, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                ref={el => (inputsRef.current[idx] = el)}
                className="w-9 h-11 text-lg md:w-12 md:h-14 md:text-2xl font-bold rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 bg-white shadow-sm transition-all outline-none placeholder:text-gray-300 text-center"
                disabled={isSubmitting}
                autoFocus={idx === 0}
                aria-label={`رقم ${idx + 1}`}
              />
            ))}
          </div>
          <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4 py-3 text-lg transition-all duration-200" disabled={isSubmitting || code.some(d => !d)}>
            {isSubmitting ? 'جاري التحقق...' : 'تحقق'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Verify; 