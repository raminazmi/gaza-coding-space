import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/lib/utils';
import Loading from '@/components/ui/Loading';
import { useToast } from '@/components/ui/use-toast';
import useAuth from '@/hooks/useAuth';

interface ProtectedLectureRouteProps {
    children: React.ReactNode;
}

const ProtectedLectureRoute: React.FC<ProtectedLectureRouteProps> = ({ children }) => {
    const { courseId, lectureId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [enrollStatus, setEnrollStatus] = useState<any>(null);
    const [course, setCourse] = useState<any>(null);
    const { toast } = useToast();
    const { authService, getToken } = useAuth();

    useEffect(() => {
        const checkAccess = async () => {
            try {
                // التحقق من حالة تسجيل الدخول أولاً
                const isAuthenticated = authService.isAuthenticated();
                const token = getToken();

                // إذا لم يكن المستخدم مسجل، وجهه مباشرة إلى تسجيل الدخول
                if (!isAuthenticated || !token) {
                    toast({
                        title: 'غير مصرح لك',
                        description: 'يجب تسجيل الدخول للوصول إلى المحاضرات.',
                        variant: 'destructive'
                    });
                    navigate('/login', { replace: true });
                    return;
                }

                // المستخدم مسجل، تحقق من صلاحيات الوصول للمحاضرة
                const [courseRes, enrollRes] = await Promise.all([
                    fetch(`${apiBaseUrl}/api/LectureDetails/${courseId}/${lectureId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(r => r.json()),
                    fetch(`${apiBaseUrl}/api/check-enroll/${courseId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(r => r.json())
                ]);

                setCourse(courseRes.course);
                setEnrollStatus(enrollRes?.enrollStatus || null);

                const isEnrolled = enrollRes?.enrollStatus?.status === 'joined';

                if (isEnrolled) {
                    // المستخدم مسجل في الدورة
                    setHasAccess(true);
                    setLoading(false);
                    return;
                }

                // إذا لم يكن مسجل في الدورة، منعه من الوصول
                toast({
                    title: 'غير مصرح لك',
                    description: 'يجب التسجيل في الدورة للوصول إلى هذه المحاضرة.',
                    variant: 'destructive'
                });
                navigate(`/courses/${courseId}`, { replace: true });
                return;

            } catch (error) {
                console.error('Error checking lecture access:', error);
                toast({
                    title: 'خطأ في النظام',
                    description: 'حدث خطأ أثناء التحقق من الصلاحيات.',
                    variant: 'destructive'
                });
                navigate(`/courses/${courseId}`, { replace: true });
            } finally {
                setLoading(false);
            }
        };

        if (courseId && lectureId) {
            checkAccess();
        } else {
            setLoading(false);
            setHasAccess(false);
        }
    }, [courseId, lectureId, navigate, toast, authService, getToken]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (!hasAccess) {
        return null;
    }

    return <>{children}</>;
};

export default ProtectedLectureRoute;
