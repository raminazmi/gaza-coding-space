import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { apiBaseUrl } from '@/lib/utils';
import { FiX, FiMail, FiRefreshCw } from 'react-icons/fi';

const CODE_LENGTH = 6;

interface CourseEnrollVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    onSuccess: (enrollStatus: any) => void;
}

const CourseEnrollVerificationModal: React.FC<CourseEnrollVerificationModalProps> = ({
    isOpen,
    onClose,
    courseId,
    onSuccess
}) => {
    const { toast } = useToast();
    const [code, setCode] = useState(Array(CODE_LENGTH).fill(''));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    // Reset code when modal opens
    useEffect(() => {
        if (isOpen) {
            setCode(Array(CODE_LENGTH).fill(''));
            setTimeout(() => {
                inputsRef.current[0]?.focus();
            }, 100);
        }
    }, [isOpen]);

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
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiBaseUrl}/api/enroll/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    code: autoCode
                })
            });

            const data = await res.json();

            if (res.ok && !data.message?.includes('خاطئ')) {
                // Success case
                toast({
                    title: data.title || 'نجاح',
                    description: data.message || 'تم التسجيل في الكورس بنجاح',
                });
                // Get updated enrollment status
                const enrollRes = await fetch(`${apiBaseUrl}/api/check-enroll/${courseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const enrollData = await enrollRes.json();
                if (enrollData.status) {
                    onSuccess(enrollData.enrollStatus);
                }
                onClose();
            } else {
                // Error case
                toast({
                    title: data.title || 'خطأ',
                    description: data.message || 'كود التحقق غير صحيح',
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

    // إعادة إرسال الكود
    const handleResendCode = async () => {
        if (isResending) return;
        setIsResending(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${apiBaseUrl}/api/resendCode/${courseId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: data.title || 'نجاح',
                    description: data.message || 'تم إرسال كود التحقق إلى بريدك الإلكتروني',
                });
                setCode(Array(CODE_LENGTH).fill(''));
                inputsRef.current[0]?.focus();
            } else {
                toast({
                    title: data.title || 'خطأ',
                    description: data.message || 'فشل في إرسال كود التحقق',
                    variant: 'destructive'
                });
            }
        } catch (err) {
            toast({
                title: 'خطأ',
                description: 'حدث خطأ أثناء الاتصال بالخادم',
                variant: 'destructive'
            });
        }
        setIsResending(false);
    };

    if (!isOpen) return null;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir="rtl">
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-auto border border-gray-200 dark:border-gray-700 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    title="close"
                    onClick={onClose}
                    className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    disabled={isSubmitting}
                >
                    <FiX className="text-xl" />
                </button>

                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMail className="text-2xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        تحقق من بريدك الإلكتروني
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                        يرجى إدخال كود التحقق المرسل إلى بريدك الإلكتروني لإتمام التسجيل في الكورس
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                                className="w-8 h-10 text-lg md:w-10 md:h-12 md:text-xl font-bold rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 shadow-sm transition-all outline-none placeholder:text-gray-300 text-center"
                                disabled={isSubmitting}
                                autoFocus={idx === 0}
                                aria-label={`رقم ${idx + 1}`}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            type="submit"
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg py-3 text-base transition-all duration-200"
                            disabled={isSubmitting || code.some(d => !d)}
                        >
                            {isSubmitting ? 'جاري التحقق...' : 'تحقق من الكود'}
                        </Button>

                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isResending || isSubmitting}
                            className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm transition-colors disabled:opacity-50"
                        >
                            <FiRefreshCw className={`text-sm ${isResending ? 'animate-spin' : ''}`} />
                            {isResending ? 'جاري الإرسال...' : 'إعادة إرسال الكود'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CourseEnrollVerificationModal;
