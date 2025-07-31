import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FiBookOpen } from 'react-icons/fi';
import Pagination from '@/components/ui/pagination';
import useAuth from '@/hooks/useAuth';

export default function MyCourses() {
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const { getToken, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchMyCourses = async () => {
            try {
                const token = getToken();
                const response = await fetch(`${apiBaseUrl}/api/my-courses?page=${currentPage}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                const data = await response.json();
                setCourses(data.myCourses?.data || []);
                setTotalPages(data.myCourses?.last_page || 1);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyCourses();
    }, [isAuthenticated, navigate, getToken, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">دوراتي</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <Card key={i} className="h-full">
                            <Skeleton className="h-48 w-full" />
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">دوراتي</h1>
                <Button variant="outline" onClick={() => navigate('/courses')}>
                    <FiBookOpen className="ml-2" />
                    تصفح المزيد من الدورات
                </Button>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12">
                    <FiBookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium">لا توجد دورات مسجلة</h3>
                    <Button onClick={() => navigate('/courses')} className="mt-4">
                        تصفح الدورات
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link to={`/courses/${course.id}`} key={course.id} className="block">
                            <Card className="h-full hover:shadow-lg transition-shadow">
                                <img
                                    src={`${apiBaseUrl}/storage/${course.image}`}
                                    alt={course.name}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <CardHeader>
                                    <CardTitle className="text-lg">{course.name}</CardTitle>
                                    <p className="text-sm text-gray-600">{course.teacher?.name}</p>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-center">
                                        <span className="text-yellow-500">★ {course.rate}</span>
                                        <span className="text-sm">{course.lectures_count} محاضرة</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}
        </div>
    );
}
