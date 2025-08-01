import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBreadcrumb } from '@/hooks/useBreadcrumb';
import { useCourseCache } from '@/hooks/useCourseCache';
import { authService } from '@/services/authService';
// Utility function to clean media URLs
const cleanMediaUrl = (url: string) => {
  if (!url) return '/assests/webapplication.webp';
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_API_BASE_URL || 'https://gazacodingspace.mahmoudalbatran.com'}${url}`;
};
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Lock,
  Heart,
  HeartOff,
  Clock,
  Users,
  Star,
  BookOpen,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// Course data cache to prevent unnecessary API calls
const courseDataCache = new Map<string, {
  data: any;
  timestamp: number;
  ttl: number;
}>();

const CourseDetails = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const { setBreadcrumbData } = useBreadcrumb();

  // Use the new course cache hook
  const { course: courseData, loading, error, refresh, clearCache } = useCourseCache(courseId);

  // Extract data from courseData
  const course = courseData?.course;
  const teacher = courseData?.course?.teacher;
  const chapters = courseData?.course?.chapters || [];
  const isFavorite = courseData?.course?.is_favorite || false;
  const enrollStatus = courseData?.enrollStatus;

  // State for UI interactions
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Memoized course data to prevent unnecessary re-renders
  const memoizedCourseData = useMemo(() => {
    if (!course) return null;

    return {
      id: course.id,
      name: course.name,
      description: course.description,
      image: cleanMediaUrl(course.image),
      price: course.price,
      duration: course.duration,
      students_count: course.students_count,
      rating: course.rating,
      is_favorite: isFavorite,
      enrollStatus: enrollStatus
    };
  }, [course, isFavorite, enrollStatus]);

  // Set breadcrumb when course data is loaded
  useEffect(() => {
    if (course) {
      setBreadcrumbData([
        { label: 'الرئيسية', href: '/' },
        { label: 'الدورات', href: '/courses' },
        { label: course.name || 'تفاصيل الدورة', href: `/courses/${courseId}` }
      ]);
    }
  }, [course, courseId, setBreadcrumbData]);

  // Enhanced enrollment with better error handling
  const handleEnroll = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للانضمام للدورة",
        variant: "destructive"
      });
      return;
    }

    if (isEnrolling) return;

    setIsEnrolling(true);

    try {
      const response = await authService.enrollInCourse(courseId!);

      if (response.success) {
        toast({
          title: "تم الانضمام بنجاح",
          description: "تم انضمامك للدورة بنجاح"
        });

        // Refresh course data to get updated enrollment status
        await refresh();
      } else {
        toast({
          title: "خطأ",
          description: response.message || "حدث خطأ في الانضمام للدورة",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الانضمام للدورة",
        variant: "destructive"
      });
    } finally {
      setIsEnrolling(false);
    }
  }, [courseId, isAuthenticated, isEnrolling, toast, refresh]);

  // Enhanced favorite toggle with optimistic updates
  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول لإضافة الدورة للمفضلة",
        variant: "destructive"
      });
      return;
    }

    if (isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    const previousState = isFavorite;

    // Optimistic update
    setIsFavorite(!isFavorite);

    try {
      const response = await authService.toggleFavorite(courseId!);

      if (response.success) {
        setIsFavorite(response.data.is_favorite);
        toast({
          title: response.data.is_favorite ? "تمت الإضافة للمفضلة" : "تم الإزالة من المفضلة",
          description: response.data.is_favorite ? "تم إضافة الدورة لقائمة المفضلة" : "تم إزالة الدورة من قائمة المفضلة"
        });

        // Invalidate cache to refresh data
        courseDataCache.delete(`course-${courseId}-${isAuthenticated}`);
      } else {
        // Revert optimistic update on failure
        setIsFavorite(previousState);
        toast({
          title: "خطأ",
          description: response.message || "حدث خطأ في تحديث المفضلة",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      // Revert optimistic update on error
      setIsFavorite(previousState);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحديث المفضلة",
        variant: "destructive"
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [courseId, isAuthenticated, isFavorite, isTogglingFavorite, toast]);

  // Enhanced enrollment with better error handling
  const handleEnroll = useCallback(async () => {
    if (!isAuthenticated) {
      toast({
        title: "تسجيل الدخول مطلوب",
        description: "يجب تسجيل الدخول للانضمام للدورة",
        variant: "destructive"
      });
      return;
    }

    if (isEnrolling) return;

    setIsEnrolling(true);

    try {
      const response = await authService.enrollInCourse(courseId!);

      if (response.success) {
        setEnrollStatus(response.data);
        toast({
          title: "تم الانضمام بنجاح",
          description: "تم انضمامك للدورة بنجاح"
        });

        // Invalidate cache to refresh data
        courseDataCache.delete(`course-${courseId}-${isAuthenticated}`);
      } else {
        toast({
          title: "خطأ",
          description: response.message || "حدث خطأ في الانضمام للدورة",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: "حدث خطأ في الانضمام للدورة",
        variant: "destructive"
      });
    } finally {
      setIsEnrolling(false);
    }
  }, [courseId, isAuthenticated, isEnrolling, toast]);

  // Enhanced lecture rendering with better performance
  const renderLectureItem = useCallback((lecture: any, chapterIndex: number, lectureIndex: number) => {
    const isAccessible = enrollStatus?.status === 'joined' || lecture.show === 1;
    const isWatched = lecture.is_watch === true;

    return (
      <div
        key={lecture.id}
        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${isAccessible
          ? 'bg-white hover:bg-gray-50 cursor-pointer border-gray-200'
          : 'bg-gray-100 cursor-not-allowed border-gray-300'
          }`}
        onClick={() => {
          if (isAccessible) {
            navigate(`/courses/${courseId}/lectures/${lecture.id}`);
          }
        }}
      >
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex-shrink-0">
            {isAccessible ? (
              <Play className="w-5 h-5 text-blue-600" />
            ) : (
              <Lock className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isAccessible ? 'text-gray-900' : 'text-gray-500'
              }`}>
              {lecture.name}
            </p>
            <div className="flex items-center space-x-2 space-x-reverse mt-1">
              <span className="text-xs text-gray-500">
                {lecture.duration || 'غير محدد'}
              </span>
              {isWatched && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          </div>
        </div>
        {!isAccessible && (
          <Badge variant="secondary" className="text-xs">
            محتوى مقفل
          </Badge>
        )}
      </div>
    );
  }, [courseId, enrollStatus, navigate]);

  // Enhanced chapter rendering
  const renderChapter = useCallback((chapter: any, index: number) => {
    const accessibleLectures = chapter.lectures?.filter((lecture: any) =>
      enrollStatus?.status === 'joined' || lecture.show === 1
    ) || [];

    return (
      <Card key={chapter.id} className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>{chapter.name}</span>
            <Badge variant="outline" className="text-xs">
              {accessibleLectures.length} محاضرة
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chapter.lectures?.map((lecture: any, lectureIndex: number) =>
              renderLectureItem(lecture, index, lectureIndex)
            )}
          </div>
        </CardContent>
      </Card>
    );
  }, [renderLectureItem, enrollStatus]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={loadData} variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  // Course not found
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">الدورة غير موجودة</h2>
          <p className="text-gray-600 mb-6">عذراً، الدورة التي تبحث عنها غير موجودة</p>
          <Button asChild>
            <Link to="/courses">العودة للدورات</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course image */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={cleanMediaUrl(course.image)}
                alt={course.name}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/assests/webapplication.webp';
                }}
              />
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  disabled={isTogglingFavorite}
                  className="bg-white/90 hover:bg-white"
                >
                  {isFavorite ? (
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                  ) : (
                    <HeartOff className="w-5 h-5 text-gray-600" />
                  )}
                </Button>
              </div>
            </div>

            {/* Course info */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-gray-600 leading-relaxed">{course.description}</p>

              {/* Course stats */}
              <div className="flex items-center space-x-6 space-x-reverse text-sm text-gray-500">
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration || 'غير محدد'}</span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Users className="w-4 h-4" />
                  <span>{course.students_count || 0} طالب</span>
                </div>
                <div className="flex items-center space-x-1 space-x-reverse">
                  <Star className="w-4 h-4" />
                  <span>{course.rating || 0}</span>
                </div>
              </div>
            </div>

            {/* Teacher info */}
            {teacher && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">المدرب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <img
                      src={cleanMediaUrl(teacher.avatar)}
                      alt={teacher.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/assests/webapplication.webp';
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                      <p className="text-sm text-gray-600">{teacher.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Chapters */}
            {chapters.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">محتوى الدورة</h2>
                {chapters.map((chapter, index) => renderChapter(chapter, index))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Enrollment card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">انضم للدورة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {course.price === 0 ? 'مجاناً' : `${course.price} ريال`}
                  </div>
                  {enrollStatus?.status === 'joined' ? (
                    <Badge className="w-full justify-center" variant="default">
                      <CheckCircle className="w-4 h-4 ml-2" />
                      منضم للدورة
                    </Badge>
                  ) : (
                    <Button
                      onClick={handleEnroll}
                      disabled={isEnrolling}
                      className="w-full"
                      size="lg"
                    >
                      {isEnrolling ? 'جاري الانضمام...' : 'انضم الآن'}
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدة:</span>
                    <span>{course.duration || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المحاضرات:</span>
                    <span>{chapters.reduce((total, chapter) => total + (chapter.lectures?.length || 0), 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الطلاب:</span>
                    <span>{course.students_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;