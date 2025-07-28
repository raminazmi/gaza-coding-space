import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FiBookOpen, FiArrowLeft, FiUsers, FiStar, FiUser } from 'react-icons/fi';
import { BsPatchCheck } from 'react-icons/bs';
import Pagination from '@/components/ui/pagination';

export default function TeacherCourses() {
    const { id } = useParams<{ id: string }>();
    const [courses, setCourses] = useState<any[]>([]);
    const [teacher, setTeacher] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [features, setFeatures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    const cleanMediaUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) {
            return url;
        }
        return `${apiBaseUrl}/storage/${url}`;
    };

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                setLoading(true);
                // Fetch teacher courses
                const courseResponse = await fetch(`${apiBaseUrl}/api/teacher/${id}?page=${currentPage}`);
                const courseData = await courseResponse.json();
                setCourses(courseData.courses?.data || []);
                setTotalPages(courseData.courses?.last_page || 1);
                setTeacher(courseData.teacher || null);

                // Fetch teacher students
                const studentsResponse = await fetch(`${apiBaseUrl}/api/teacher-students/${id}`);
                const studentsData = await studentsResponse.json();
                // Sort students by pivot.created_at in descending order (latest first)
                const sortedStudents = (studentsData.students || []).sort((a: any, b: any) =>
                    new Date(b.pivot.created_at).getTime() - new Date(a.pivot.created_at).getTime()
                );
                setStudents(sortedStudents);

                // Fetch teacher features
                const featuresResponse = await fetch(`${apiBaseUrl}/api/teacher-features/${id}`);
                const featuresData = await featuresResponse.json();
                setFeatures(featuresData.features || []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchTeacherData();
    }, [id, currentPage]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i} className="h-full">
                            <Skeleton className="h-48 w-full" />
                            <CardContent className="p-4">
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8" dir="rtl">
            {/* Teacher Details */}
            {teacher && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">عن المدرب</h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="md:w-1/4 flex justify-center">
                            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {teacher.profile_photo_url ? (
                                    <img
                                        src={cleanMediaUrl(teacher.profile_photo_url)}
                                        alt={teacher.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <FiUser className="text-4xl text-gray-600 dark:text-gray-300" />
                                )}
                            </div>
                        </div>
                        <div className="md:w-3/4 space-y-4">
                            <div>
                                <h4 className="text-lg font-bold dark:text-gray-100">{teacher.name}</h4>
                                <p className="text-gray-600 dark:text-gray-300">{teacher.title || 'مدرب محترف'}</p>
                                <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                                    {teacher.email || ''}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                    <FiUsers className="text-blue-500" />
                                    <span>{teacher.students_count || 0} طالب</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiBookOpen className="text-blue-500" />
                                    <span>{teacher.courses_count || 0} كورس</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiStar className="text-blue-500" />
                                    <span>التقييم: {teacher.rating || 'غير متاح'}</span>
                                </div>
                            </div>

                            <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                                {teacher.bio || 'لا يوجد وصف متاح للمدرب.'}
                            </p>

                            {features.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">المميزات التعليمية</h4>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {features.map((feature: any, index: number) => (
                                            <li key={feature.id || index} className="flex items-start gap-2">
                                                <BsPatchCheck className="text-green-500 mt-1" />
                                                <span>{feature.name}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Latest Students */}
            {students.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">أحدث الطلاب المسجلين</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {students.slice(0, 6).map((student: any) => (
                            <Card key={student.id} className="flex items-center p-4 hover:shadow-lg transition-shadow">
                                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden mr-4">
                                    {student.profile_photo_url ? (
                                        <img
                                            src={cleanMediaUrl(student.profile_photo_url)}
                                            alt={student.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl font-medium text-gray-600 dark:text-gray-300">
                                            {student.name?.charAt(0) || '?'}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-100">{student.name}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        انضم في: {new Date(student.pivot.created_at).toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Courses List */}
            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">لا توجد دورات متاحة</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link to={`/courses/${course.id}`} key={course.id}>
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <img
                                    src={course.image ? cleanMediaUrl(course.image) : '/placeholder-course.jpg'}
                                    alt={course.name}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <CardContent className="p-4">
                                    <h3 className="font-semibold mb-2">{course.name}</h3>
                                    <p className="text-sm text-gray-500">{teacher?.name || 'المدرب'}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-8">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}