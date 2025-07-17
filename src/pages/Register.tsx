import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { FiUserPlus, FiMail, FiLock, FiUser } from 'react-icons/fi';
import { apiBaseUrl } from '@/lib/utils';

const Register = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
        })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        toast({ title: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني', description: data.message });
        navigate('/verify', { state: { email } });
        setIsSubmitting(false);
      return;
      } else {
        toast({ title: 'خطأ', description: data.message || 'حدث خطأ أثناء التسجيل', variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الاتصال بالخادم', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900" dir="rtl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-10 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">إنشاء حساب جديد</h1>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-300">أدخل اسمك وبريدك الإلكتروني لإنشاء حساب</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <Label htmlFor="firstName" className="text-sm md:text-base dark:text-gray-200">الاسم الكامل</Label>
            <Input id="firstName" name="firstName" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" required />
          </div>
          <div>
            <Label htmlFor="email" className="text-sm md:text-base dark:text-gray-200">البريد الإلكتروني</Label>
            <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl shadow-elegant h-12 mt-2 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500" required />
          </div>
          <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-4 py-3 text-lg transition-all duration-200 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white" disabled={isSubmitting}>
            {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </Button>
        </form>
        <div className="text-center mt-6">
          <span className="text-gray-500 dark:text-gray-300 text-sm md:text-base">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Register;