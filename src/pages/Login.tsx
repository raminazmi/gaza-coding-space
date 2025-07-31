import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks';
import useAuth from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { FiLogIn, FiMail } from 'react-icons/fi';

const Login = () => {
  const { toast } = useToast();
  const { isAuthenticated, authService, canAttemptLogin, getWaitTimeUntilNextAttempt, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limiting
    if (!canAttemptLogin()) {
      const waitTime = Math.ceil(getWaitTimeUntilNextAttempt() / 1000 / 60);
      toast({
        title: 'تم تجاوز عدد المحاولات المسموح',
        description: `يرجى المحاولة بعد ${waitTime} دقيقة`,
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // استخدام authService لإرسال طلب تسجيل الدخول (email only)
      const result = await authService.apiCall('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }, false);

      if (result.success && result.data?.message) {
        toast({
          title: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
          description: result.data.message
        });
        navigate('/verify', { state: { email } });
      } else {
        toast({
          title: 'خطأ',
          description: result.message || 'حدث خطأ أثناء تسجيل الدخول',
          variant: 'destructive'
        });
      }
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء الاتصال بالخادم',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">تسجيل الدخول</h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-300">أدخل بريدك الإلكتروني لتسجيل الدخول</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-sm md:text-base dark:text-gray-200">البريد الإلكتروني</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
              required
              disabled={isSubmitting || !canAttemptLogin()}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4 py-3 text-lg transition-all duration-200 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white"
            disabled={isSubmitting || !canAttemptLogin()}
          >
            {isSubmitting ? 'جاري تسجيل الدخول...' :
              !canAttemptLogin() ? `انتظر ${Math.ceil(getWaitTimeUntilNextAttempt() / 1000 / 60)} دقيقة` :
                'تسجيل الدخول'}
          </Button>
        </form>
        <div className="text-center mt-6">
          <span className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              إنشاء حساب جديد
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;