import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/hooks';
import { loginSuccess } from '@/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const CODE_LENGTH = 6;

const Verify = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
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
      const res = await fetch('https://gazacodingspace.mahmoudalbatran.com/api/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          login_code: autoCode,
        })
      });
      if (res.ok) {
        const token = await res.text();
        localStorage.setItem('token', token);
        toast({ title: 'تم التحقق بنجاح', description: 'تم تسجيل الدخول بنجاح' });
        navigate('/');
      } else {
        toast({ title: 'خطأ', description: 'رمز التحقق غير صحيح', variant: 'destructive' });
        setCode(Array(CODE_LENGTH).fill(''));
        inputsRef.current[0]?.focus();
      }
    } catch (err) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء الاتصال بالخادم', variant: 'destructive' });
    }
    setIsSubmitting(false);
  };

  // إرسال يدوي عند الضغط على الزر
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.every((digit) => digit.length === 1)) {
      handleSubmitAuto(code.join(''));
    }
  };

  return (
    <div className="min-h-screen py-16 bg-gradient-hero flex items-center justify-center" dir="rtl">
      <div className="bg-gradient-card rounded-2xl shadow-elegant p-10 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow mb-2">
            تحقق من بريدك الإلكتروني
          </h1>
          <p className="text-xl text-muted-foreground">
            يرجى إدخال كود التحقق المرسل إلى بريدك الإلكتروني
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex justify-center gap-2 flex-row-reverse" dir="rtl">
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
                className="w-12 h-14 text-center text-2xl font-mono rounded-xl border border-primary focus:ring-2 focus:ring-primary transition-all"
                disabled={isSubmitting}
                autoFocus={idx === 0}
                aria-label={`رقم ${idx + 1}`}
              />
            ))}
          </div>
          <Button type="submit" size="lg" className="bg-gradient-primary hover:shadow-glow rounded-2xl mt-4" disabled={isSubmitting || code.some(d => !d)}>
            {isSubmitting ? 'جاري التحقق...' : 'تحقق'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Verify; 