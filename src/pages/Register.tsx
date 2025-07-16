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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background" dir="rtl">
      <div className="bg-gradient-card rounded-2xl shadow-elegant p-10 w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow mb-2">
              إنشاء حساب جديد
          </h1>
          <p className="text-xl text-muted-foreground">
              أدخل اسمك وبريدك الإلكتروني لإنشاء حساب
          </p>
            </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <Label htmlFor="firstName">الاسم الكامل</Label>
            <Input id="firstName" name="firstName" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl shadow-elegant h-12 mt-2" required />
                  </div>
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl shadow-elegant h-12 mt-2" required />
                </div>
          <Button type="submit" size="lg" className="bg-gradient-primary hover:shadow-glow rounded-2xl mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'جاري الإرسال...' : 'إنشاء حساب'}
              </Button>
            </form>
        <div className="text-center mt-6">
          <span className="text-muted-foreground text-sm">
            لديك حساب بالفعل؟{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
              تسجيل الدخول
                </Link>
          </span>
            </div>
      </div>
    </div>
  );
};

export default Register;