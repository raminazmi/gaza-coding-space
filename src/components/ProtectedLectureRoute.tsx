import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const token = localStorage.getItem('token');

                const [courseRes, enrollRes] = await Promise.all([
                    fetch(`${apiBaseUrl}/api/LectureDetails/${courseId}/${lectureId}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {}
                    }).then(r => r.json()),
                    token ? fetch(`${apiBaseUrl}/api/check-enroll/${courseId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).then(r => r.json()) : Promise.resolve(null)
                ]);

                setCourse(courseRes.course);
                setEnrollStatus(enrollRes?.enrollStatus || null);

                const isEnrolled = enrollRes?.enrollStatus?.status === 'joined';

                if (isEnrolled) {
                    setHasAccess(true);
                    setLoading(false);
                    return;
                }

                const chapters = courseRes.course?.chapters || [];
                if (chapters.length > 0) {
                    const firstChapter = chapters[0];
                    const allowedLectures = firstChapter.lectures ? firstChapter.lectures.slice(0, 2) : [];
                    const isAllowedLecture = allowedLectures.some((lec: any) => String(lec.id) === String(lectureId));

                    if (isAllowedLecture) {
                        setHasAccess(true);
                    } else {
                        if (allowedLectures.length > 0) {
                            toast({
                                title: 'غير مصرح لك',
                                description: 'يجب التسجيل في الدورة للوصول إلى هذه المحاضرة. تم توجيهك إلى أول محاضرة متاحة.',
                                variant: 'destructive'
                            });
                            navigate(`/courses/${courseId}/lecture/${allowedLectures[0].id}`, { replace: true });
                            return;
                        } else {
                            setHasAccess(false);
                        }
                    }
                } else {
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
