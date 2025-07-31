import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { apiBaseUrl } from '@/lib/utils';
import Loading from '@/components/ui/Loading';
import { useToast } from '@/components/ui/use-toast';

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
    const { getToken } = useAuth();

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const token = getToken();

                const [courseRes, enrollRes] = await Promise.all([
                    fetch(`${apiBaseUrl}/api/LectureDetails/${courseId}/${lectureId}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }).then(async (r) => {
                        if (!r.ok) {
                            if (r.status === 429) {
                                console.warn('Rate limit exceeded for lecture details');
                                return { course: null };
                            }
                            throw new Error(`HTTP ${r.status}`);
                        }
                        return r.json();
                    }),
                    token ? fetch(`${apiBaseUrl}/api/check-enroll/${courseId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(async (r) => {
                        if (!r.ok) {
                            if (r.status === 429) {
                                console.warn('Rate limit exceeded for enrollment check');
                                return null;
                            }
                            throw new Error(`HTTP ${r.status}`);
                        }
                        return r.json();
                    }) : Promise.resolve(null)
                ]);

                setCourse(courseRes.course);
                setEnrollStatus(enrollRes?.enrollStatus || null);

                const isEnrolled = enrollRes?.enrollStatus?.status === 'joined';

                // Check if lecture is shown to visitors (show === 1) - هذا يجب أن يكون أولاً
                const lecture = courseRes.course?.chapters?.flatMap((ch: any) => ch.lectures || []).find((lec: any) => String(lec.id) === String(lectureId));

                if (lecture && lecture.show === 1) {
                    // المحاضرة مفتوحة للجميع
                    setHasAccess(true);
                    setLoading(false);
                    return;
                }

                if (isEnrolled) {
                    // المستخدم مسجل في الدورة
                    setHasAccess(true);
                    setLoading(false);
                    return;
                }

                // إذا لم يكن المستخدم مسجل ولم تكن المحاضرة متاحة للزوار
                if (!token) {
                    // البحث عن أول محاضرة متاحة للزوار
                    const allLectures = courseRes.course?.chapters?.flatMap((ch: any) => ch.lectures || []) || [];
                    const firstAvailableLecture = allLectures.find((lec: any) => lec.show === 1);

                    if (firstAvailableLecture) {
                        toast({
                            title: 'غير مصرح لك',
                            description: 'يجب التسجيل في الدورة للوصول إلى هذه المحاضرة. تم توجيهك إلى أول محاضرة متاحة.',
                            variant: 'destructive'
                        });
                        navigate(`/courses/${courseId}/lecture/${firstAvailableLecture.id}`, { replace: true });
                        return;
                    } else {
                        setHasAccess(false);
                    }
                } else {
                    // المستخدم مسجل لكن ليس منضم للكورس
                    setHasAccess(false);
                }
            } catch (error) {
                console.error('Error checking lecture access:', error);
                setHasAccess(false);
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
    }, [courseId, lectureId, navigate, toast]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (!hasAccess) {
        navigate(`/courses/${courseId}`, { replace: true });
        return null;
    }

    return <>{children}</>;
};

export default ProtectedLectureRoute;
