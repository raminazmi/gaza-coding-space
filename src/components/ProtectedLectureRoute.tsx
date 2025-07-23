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

                // Fetch course details and enrollment status
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

                // Check if user is enrolled
                const isEnrolled = enrollRes?.enrollStatus?.status === 'joined';

                if (isEnrolled) {
                    setHasAccess(true);
                    setLoading(false);
                    return;
                }

                // If not enrolled, check if this lecture is in the first 2 lectures of first chapter
                const chapters = courseRes.course?.chapters || [];
                if (chapters.length > 0) {
                    const firstChapter = chapters[0];
                    const allowedLectures = firstChapter.lectures ? firstChapter.lectures.slice(0, 2) : [];
                    const isAllowedLecture = allowedLectures.some((lec: any) => String(lec.id) === String(lectureId));

                    if (isAllowedLecture) {
                        setHasAccess(true);
                    } else {
                        // User is trying to access a restricted lecture, redirect to first allowed lecture
                        if (allowedLectures.length > 0) {
                            // Show toast notification
                            toast({
                                title: 'غير مصرح لك',
                                description: 'يجب التسجيل في الدورة للوصول إلى هذه المحاضرة. تم توجيهك إلى أول محاضرة متاحة.',
                                variant: 'destructive'
                            });
                            // Navigate to first allowed lecture
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
        // Redirect to course details page
        navigate(`/courses/${courseId}`, { replace: true });
        return null;
    }

    return <>{children}</>;
};

export default ProtectedLectureRoute;
