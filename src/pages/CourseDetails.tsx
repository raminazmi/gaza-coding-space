import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiBaseUrl } from '@/lib/utils';
import {
  FiUsers, FiBookOpen, FiChevronDown, FiChevronUp,
  FiUser, FiClock, FiGlobe, FiCalendar, FiPlay, FiLock, FiStar,
  FiAward, FiFileText, FiDownload, FiHeart, FiShare2, FiBarChart2,
  FiCheckCircle
} from 'react-icons/fi';
import { MdOutlineVideoLibrary, MdOutlineQuiz, MdOutlineAssignment } from 'react-icons/md';
import { BsBookmarkCheck, BsPatchCheck } from 'react-icons/bs';
import CourseDetailsSkeleton from '@/components/ui/CourseDetailsSkeleton';
import CourseEnrollVerificationModal from '@/components/ui/CourseEnrollVerificationModal';
import { useDominantColorBackground } from "@/hooks/useDominantColorBackground";
import useBreadcrumb from '@/hooks/useBreadcrumb';
import useAuth from '@/hooks/useAuth';
import defaultCourseImage from '@public/assests/webapplication.webp';

const CourseDetails = () => {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollStatus, setEnrollStatus] = useState<any>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [tab, setTab] = useState('lectures');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [didAutoExpand, setDidAutoExpand] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [hasAutoShownModal, setHasAutoShownModal] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const navigate = useNavigate();
  const { setCourse: setBreadcrumbCourse, setTeacher: setBreadcrumbTeacher } = useBreadcrumb();
  const { authService, getToken } = useAuth();
  const [isSharing, setIsSharing] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [imageUrl, setImageUrl] = React.useState('');
  const [previewUrl, setPreviewUrl] = React.useState('');

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setPreviewUrl(url);
    }
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setPreviewUrl(e.target.value);
  };



  useEffect(() => {
    setLoading(true);

    const loadData = async () => {
      try {
        // Check authentication status
        const isAuth = authService.isAuthenticated();
        const token = getToken();

        // Fetch course details using authService
        const courseResult = await authService.getCourseDetails(courseId!);

        // Fetch course requirements
        const requirementsResult = await authService.apiCall(`/api/course-requirement/${courseId}`, {}, false);

        if (courseResult.success && courseResult.data) {
          const courseData = courseResult.data;

          // Set course data
          setCourse(courseData.course);
          setIsFavorite(courseData.course?.is_favorite || false);
          setEnrollStatus(courseData.enrollStatus || null);
          setChapters(courseData.course?.chapters || []);
          setTeacher(courseData.course?.teacher || null);

          // Fallback: Check if user has access to lectures (indicates enrollment)
          if (!courseData.enrollStatus && isAuth && token && courseData.course?.chapters) {
            const hasLectureAccess = courseData.course.chapters.some((chapter: any) =>
              chapter.lectures?.some((lecture: any) => lecture.is_watch === true)
            );

            if (hasLectureAccess) {
              setEnrollStatus({ status: 'joined', detected_from: 'lecture_access' });
            }
          }

          // If no enrollment status in main response and user is authenticated, check separately
          if (!courseData.enrollStatus && isAuth && token) {
            try {
              const enrollResult = await authService.checkEnrollment(courseId!);
              if (enrollResult.success && enrollResult.data) {
                // Handle different response formats
                let processedStatus = enrollResult.data;

                // If data.enrollStatus exists, use it
                if (enrollResult.data.enrollStatus) {
                  processedStatus = enrollResult.data.enrollStatus;
                }
                // If data.status is boolean true, convert to 'joined'
                else if (enrollResult.data.status === true) {
                  processedStatus = { status: 'joined', ...enrollResult.data };
                }

                setEnrollStatus(processedStatus);
              }
            } catch (enrollError) {
              console.warn('Could not check enrollment status:', enrollError);
            }
          }

          // Auto-expand first chapter
          if (courseData.course?.chapters?.length > 0 && !didAutoExpand) {
            setExpanded(String(courseData.course.chapters[0].id));
            setDidAutoExpand(true);
          }

          // Save breadcrumb data
          if (courseData.course?.name && courseId) {
            setBreadcrumbCourse({
              name: courseData.course.name,
              id: courseId,
              teacherName: courseData.course.teacher?.name || courseData.course.user,
              teacherId: courseData.course.teacher?.id?.toString()
            });
          }

          if (courseData.course?.teacher?.name && courseData.course?.teacher?.id) {
            setBreadcrumbTeacher({
              name: courseData.course.teacher.name,
              id: courseData.course.teacher.id.toString()
            });
          }
        }

        // Handle requirements
        if (requirementsResult.success && requirementsResult.data) {
          setRequirements(requirementsResult.data.CourseRequirement || []);
        } else {
          setRequirements([]);
        }

      } catch (error) {
        console.error('Error loading course data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId]);

  useEffect(() => {
    if (
      !didAutoExpand &&
      chapters &&
      chapters.length > 0 &&
      expanded === null
    ) {
      setExpanded(String(chapters[0].id));
      setDidAutoExpand(true);
    }
  }, [chapters, expanded, didAutoExpand]);

  useEffect(() => {
    if (enrollStatus && enrollStatus.status === 'pending' && !showVerificationModal && !hasAutoShownModal) {
      setShowVerificationModal(true);
      setHasAutoShownModal(true);
    }
  }, [enrollStatus, showVerificationModal, hasAutoShownModal]);

  const toggleFavorite = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const result = await authService.toggleFavorite(courseId!);

      if (!result.success) {
        console.warn('Failed to toggle favorite:', result.message);
        return;
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleEnroll = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setEnrollLoading(true);
    try {
      const result = await authService.enrollInCourse(courseId!);

      if (!result.success) {
        console.warn('Failed to enroll:', result.message);
        return;
      }

      if (result.data?.message) {
        setShowVerificationModal(true);
        setIsPendingVerification(true);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleVerificationSuccess = async () => {
    setShowVerificationModal(false);
    setIsPendingVerification(false);

    const token = getToken();
    if (!token) return;

    try {
      const result = await authService.checkEnrollment(courseId!);

      if (result.success && result.data?.status) {
        setEnrollStatus(result.data.enrollStatus);
      }
    } catch (error) {
      console.error('Error checking enrollment status:', error);
    }
  };

  function cleanMediaUrl(url: string) {
    if (!url) return '';
    if (url.startsWith('http')) {
      return url;
    }
    return `${apiBaseUrl}/storage/${url}`;
  }

  const renderLectureIcon = (lectureType: string) => {
    switch (lectureType) {
      case 'video':
        return <FiPlay className="text-blue-500" />;
      case 'quiz':
        return <MdOutlineQuiz className="text-purple-500" />;
      case 'assignment':
        return <MdOutlineAssignment className="text-green-500" />;
      case 'article':
        return <FiFileText className="text-orange-500" />;
      default:
        return <FiBookOpen className="text-blue-500" />;
    }
  };

  const renderEnrollButton = () => {

    // Check for pending status
    if ((enrollStatus && enrollStatus.status === 'pending') || isPendingVerification) {
      return (
        <button
          onClick={() => setShowVerificationModal(true)}
          className="w-full bg-yellow-100 text-yellow-700 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 hover:bg-yellow-200 transition-colors"
        >
          <FiLock /> يجب التحقق من الكود
        </button>
      );
    }

    // Check for joined/enrolled status (multiple possible formats)
    const isEnrolled = enrollStatus && (
      enrollStatus.status === 'joined' ||
      enrollStatus.status === true ||
      enrollStatus.status === 'enrolled' ||
      (enrollStatus.enrollStatus && enrollStatus.enrollStatus.status === 'joined')
    );

    if (isEnrolled) {
      return (
        <button
          className="w-full bg-green-100 text-green-700 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2"
          disabled
        >
          <FiCheckCircle /> مسجل بالفعل
        </button>
      );
    }

    if (course.salary === 'مجاني') {
      return (
        <button
          onClick={handleEnroll}
          disabled={enrollLoading}
          className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${enrollLoading ? 'opacity-70' : ''}`}
        >
          {enrollLoading ? 'جاري التسجيل...' : 'سجل الآن مجاناً'}
        </button>
      );
    }

    return (
      <button
        onClick={handleEnroll}
        disabled={enrollLoading}
        className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-2 ${enrollLoading ? 'opacity-70' : ''}`}
      >
        {enrollLoading ? 'جاري التسجيل...' : `اشترك الآن - ${course.salary}`}
      </button>
    );
  };

  function parseMinutes(str: string) {
    if (!str) return 0;
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  function timeAgo(dateString: string) {
    if (!dateString) return 'غير محدد';

    try {
      const now = new Date();
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return 'غير محدد';
      }

      const diff = (now.getTime() - date.getTime()) / 1000;

      // Check if diff is valid
      if (isNaN(diff) || diff < 0) {
        return 'غير محدد';
      }

      if (diff < 60) return 'الآن';
      if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
      if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
      if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
      if (diff < 2592000) return `منذ ${Math.floor(diff / 604800)} أسبوع`;
      if (diff < 31536000) return `منذ ${Math.floor(diff / 2592000)} شهر`;
      return `منذ ${Math.floor(diff / 31536000)} سنة`;
    } catch (error) {
      return 'غير محدد';
    }
  }

  const headerBg: string = useDominantColorBackground(
    course?.image ? cleanMediaUrl(course.image) : defaultCourseImage,
    "linear-gradient(to right, #1e4f94, #00f2ff)"
  );
  const courseImage = course?.image ? cleanMediaUrl(course.image) : defaultCourseImage;
  const handleShare = async () => {
    if (!course || !courseId || isSharing) return; // منع التنفيذ إذا كان المشاركة جارية
    setIsSharing(true);
    const shareUrl = `${window.location.origin}/courses/${courseId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'كورس مذهل',
          text: `تحقق من هذا الكورس المذهل: ${course.discription} - ${shareUrl}`,
          url: shareUrl,
        });
        console.log('Course shared successfully');
      } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('تم نسخ رابط الكورس إلى الحافظة!');
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      if (error instanceof Error && error.message.includes('InvalidStateError')) {
        alert('من فضلك، انتظر حتى تكتمل العملية السابقة قبل المحاولة مجددًا.');
      }
    } finally {
      setIsSharing(false); // إعادة تفعيل الزر بعد انتهاء العملية
    }
  };

  if (loading) {
    return <CourseDetailsSkeleton />;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
          <FiBookOpen className="mx-auto text-5xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">لم يتم العثور على الكورس</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">الكورس الذي تبحث عنه غير موجود أو قد تم إزالته</p>
          <button
            onClick={() => navigate('/courses')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تصفح الكورسات المتاحة
          </button>
        </div>
      </div>
    );
  }

  // Use chapters from state instead of directly from course
  const totalMinutes = chapters.reduce((acc, chapter) =>
    acc + (chapter.lectures?.reduce((sum, lec) => sum + parseMinutes(lec.timeLecture), 0) || 0), 0
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = defaultCourseImage;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="shadow text-white py-8" style={{ background: headerBg }}>
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3 flex justify-center">
              {course.videos ? (
                <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
                  <video className="w-full h-48 md:h-64 object-cover" poster={previewUrl}>
                    <source src={previewUrl} type="video/mp4" />
                  </video>
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-30 hover:bg-opacity-40 transition-all"
                    onClick={() => navigate(`/courses/${courseId}/lecture/${chapters[0]?.lectures[0]?.id}`)}
                    title="تحميل الملف"
                  >
                    <FiPlay className="text-4xl" />
                  </button>
                </div>
              ) : courseImage ? (
                <img
                  src={courseImage}
                  onError={handleImageError}
                  alt={course.name}
                  loading="lazy"
                  className="w-full max-w-md h-48 md:h-64 object-cover rounded-xl shadow-2xl"
                />
              ) : (
                <div className="w-full max-w-md h-48 md:h-64 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-2xl flex items-center justify-center">
                  <FiBookOpen className="text-5xl text-gray-400" />
                </div>
              )}
            </div>
            <div className="md:w-2/3 space-y-4">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl md:text-3xl font-bold drop-shadow-md text-white">{course.name}</h1>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full ${isFavorite ? 'text-red-500' : 'text-white'}`}
                  title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                >
                  <FiHeart className={`text-xl ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <p className="text-white leading-relaxed">{course.discription || course.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                  <FiUser className="text-white" />
                  <span>المدرب: {teacher?.name || course.user || '-'}</span>
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                  <FiGlobe className="text-white" />
                  <span>اللغة: {course.lan || '-'}</span>
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                  <FiClock className="text-white" />
                  <span>المدة: {totalMinutes > 0 ? `${totalMinutes} دقيقة` : '-'}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded">
                  <MdOutlineVideoLibrary className="text-white" />
                  <span>{chapters.length || 0} محاضرة</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded">
                  <FiStar className="text-white" />
                  <span>التقييم: {course.rate || 'غير متاح'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="lg:w-2/3 w-full space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`px-6 py-3 font-medium ${tab === 'lectures' ? 'text-blue-600 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  onClick={() => setTab('lectures')}
                >
                  <div className="flex items-center gap-2">
                    <FiBookOpen /> محتوى الكورس
                  </div>
                </button>
                <button
                  className={`px-6 py-3 font-medium ${tab === 'details' ? 'text-blue-600 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  onClick={() => setTab('details')}
                >
                  <div className="flex items-center gap-2">
                    <FiFileText /> التفاصيل
                  </div>
                </button>
                <button
                  className={`px-6 py-3 font-medium ${tab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600 dark:border-blue-400' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'}`}
                  onClick={() => setTab('reviews')}
                >
                  <div className="flex items-center gap-2">
                    <FiStar /> التقييمات
                  </div>
                </button>
              </div>

              <div className="p-6">
                {tab === 'lectures' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">محتوى الكورس</h3>

                    {chapters.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                        <FiBookOpen className="mx-auto text-3xl mb-3" />
                        <p>لا يوجد محتوى متاح لهذا الكورس بعد</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {chapters.map((chapter: any, idx) => (
                          <div key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <button
                              className="w-full flex justify-between items-center px-5 py-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold text-gray-700 dark:text-gray-100 transition-all"
                              onClick={() => setExpanded(expanded === String(chapter.id) ? null : String(chapter.id))}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                                  {idx + 1}
                                </div>
                                <span>{chapter.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-300">
                                  {chapter.lectures && chapter.lectures.length > 0
                                    ? `${chapter.lectures.reduce((sum, lec) => sum + parseMinutes(lec.timeLecture), 0)} دقيقة`
                                    : ''}
                                </span>
                                {expanded === String(chapter.id) ? <FiChevronUp /> : <FiChevronDown />}
                              </div>
                            </button>

                            <div
                              className={`transition-all duration-300 overflow-hidden ${expanded === String(chapter.id) ? 'max-h-screen' : 'max-h-0'}`}
                            >
                              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {chapter.lectures?.length === 0 && (
                                  <li className="text-center py-4 text-gray-500 dark:text-gray-300 text-sm">
                                    لا يوجد محاضرات في هذا الفصل
                                  </li>
                                )}
                                {chapter.lectures?.map((lec: any, index: number) => {
                                  // Check if user is enrolled or if lecture is shown to visitors
                                  const isEnrolled = enrollStatus && enrollStatus.status === 'joined';
                                  const isShownToVisitors = lec.show === 1;
                                  const canAccess = isEnrolled || isShownToVisitors;

                                  return (
                                    <li
                                      key={lec.id}
                                      className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${lec.is_watch ? 'bg-green-50 dark:bg-green-900/30' : ''}`}
                                      onClick={() => {
                                        if (!canAccess) {
                                          return;
                                        }
                                        navigate(`/courses/${courseId}/lecture/${lec.id}`);
                                      }}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 flex items-center justify-center">
                                          {renderLectureIcon(lec.type)}
                                        </div>
                                        <span className={`text-sm ${!canAccess ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-100'}`}>
                                          {index + 1}. {lec.name}
                                          {lec.is_watch && (
                                            <span className="mr-2 text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-2 py-0.5 rounded-full">
                                              تمت المشاهدة
                                            </span>
                                          )}
                                          {isShownToVisitors && !isEnrolled && (
                                            <span className="mr-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                              مجاني
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-300">
                                          {lec.timeLecture || '00:00'}
                                        </span>
                                        {!canAccess ? (
                                          <FiLock className="text-gray-400 dark:text-gray-500" />
                                        ) : (
                                          <FiPlay className="text-blue-500" />
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === 'details' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">عن الكورس</h3>
                    <div className="prose max-w-none text-gray-700 dark:text-gray-200">
                      {course.long_description || course.discription || course.description || 'لا يوجد وصف مفصل متاح لهذا الكورس.'}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-8 mb-4">ما ستتعلمه</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {course.features && course.features.length > 0 ? (
                        course.features.map((feature: { name: string; id: number }, index: number) => (
                          <li key={feature.id || index} className="flex items-start gap-2">
                            <BsPatchCheck className="text-green-500 mt-1" />
                            <span>{feature.name}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 dark:text-gray-300">لا يوجد معلومات عن المحتوى التعليمي</li>
                      )}
                    </ul>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-8 mb-4">متطلبات الكورس</h3>
                    {requirements.length > 0 ? (
                      <ul className="space-y-3">
                        {requirements.map((req, index) => (
                          <li key={req.id} className="flex items-start gap-3">
                            <div className="mt-1 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            <span className="text-gray-700 dark:text-gray-200">{req.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">لا توجد متطلبات مسبقة لهذا الكورس</p>
                    )}
                  </div>
                )}

                {tab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">تقييمات الطلاب</h3>
                    {course.reviews?.length > 0 ? (
                      <div className="space-y-6">
                        {course.reviews.map((review: any) => (
                          <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <FiUser className="text-gray-600 dark:text-gray-300" />
                              </div>
                              <div>
                                <h4 className="font-medium dark:text-gray-100">{review.user.name}</h4>
                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-300">
                                  <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <FiStar
                                        key={i}
                                        className={i < review.rating ? 'fill-current' : ''}
                                      />
                                    ))}
                                  </div>
                                  <span>•</span>
                                  <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-200">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-300">
                        <FiStar className="mx-auto text-3xl mb-3" />
                        <p>لا يوجد تقييمات لهذا الكورس بعد</p>
                        {enrollStatus && (
                          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            أضف تقييمك
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {teacher && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
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

                    <Link
                      to={`/teacher/${teacher.id}`}
                      className="inline-flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                      onClick={(e) => {
                        setBreadcrumbTeacher({
                          name: teacher.name,
                          id: teacher.id.toString()
                        });
                      }}
                    >
                      عرض جميع كورسات المدرب
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </main>

          <aside className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-xl mb-4 md:mb-0 md:sticky md:top-20 max-h-fit overflow-y-auto">
            <div className="overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">سعر الكورس</h3>
                  <span className="text-xl md:text-2xl font-bold text-blue-600">
                    {course.salary ? `${course.salary} $` : 'مجاني'}
                  </span>
                </div>

                {renderEnrollButton()}

                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="w-full mt-3 border border-blue-500 text-blue-500 py-2 md:py-3 rounded-lg font-bold hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  title="مشاركة الكورس"
                >
                  <FiShare2 /> مشاركة الكورس
                </button>
              </div>

              <div className="p-3 md:p-6 space-y-4">
                <h4 className="font-bold text-gray-700 dark:text-gray-100 text-base md:text-lg">معلومات الكورس</h4>
                <ul className="space-y-3">
                  <li className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <FiBookOpen /> المحاضرات
                    </span>
                    <span className="font-medium">{chapters.length || 0}</span>
                  </li>
                  <li className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <FiClock /> المدة
                    </span>
                    <span className="font-medium">{totalMinutes > 0 ? `${totalMinutes} دقيقة` : '-'}</span>
                  </li>
                  <li className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <FiGlobe /> اللغة
                    </span>
                    <span className="font-medium">{course.lan || '-'}</span>
                  </li>
                  <li className="flex justify-between text-sm md:text-base">
                    <span className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <FiCalendar /> آخر تحديث
                    </span>
                    <span className="font-semibold text-primary">
                      {timeAgo(course.updated_at || course.updatedAt || course.created_at)}
                    </span>
                  </li>
                </ul>
              </div>

              {course.resources?.length > 0 && (
                <div className="p-3 md:p-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-bold text-gray-700 dark:text-gray-100 mb-3 text-base md:text-lg">الملفات المرفقة</h4>
                  <ul className="space-y-2">
                    {course.resources.map((resource: any) => (
                      <li key={resource.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 md:p-3 rounded-lg text-sm md:text-base">
                        <div className="flex items-center gap-2">
                          <FiFileText className="text-gray-500 dark:text-gray-300" />
                          <span>{resource.name}</span>
                        </div>
                        <a
                          href={cleanMediaUrl(resource.file)}
                          download
                          className="text-blue-500 hover:text-blue-700"
                          title={`تحميل ${resource.name}`}
                        >
                          <FiDownload />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {course.certificate && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-3 md:p-6 mt-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-2 md:p-3 rounded-full">
                    <FiAward className="text-blue-600 text-lg md:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base md:text-lg">شهادة إتمام</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm mt-1">
                      احصل على شهادة معتمدة عند إتمامك لهذا الكورس بنجاح
                    </p>
                  </div>
                </div>
              </div>
            )}

            {enrollStatus && (
              <div className="rounded-md shadow p-2 md:p-3 mt-4 bg-white dark:bg-gray-800">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 dark:bg-green-900/40 p-2 md:p-3 rounded-full">
                    <FiCheckCircle className="text-green-600 text-lg md:text-xl" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 text-base md:text-lg">حالة التسجيل</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm mt-1">
                      أنت مسجل في هذا الكورس منذ {new Date(enrollStatus.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs md:text-sm mt-2">
                      الحالة: <span className="font-medium text-green-600">
                        {enrollStatus.status === 'joined' ? 'مسجل' : enrollStatus.status === 'pending' ? 'قيد التحقق' : enrollStatus.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Teacher Section */}
      {teacher && (
        <div className="container max-w-6xl mx-auto px-4 pb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
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

                <Link
                  to={`/teacher/${teacher.id}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                  onClick={(e) => {
                    setBreadcrumbTeacher({
                      name: teacher.name,
                      id: teacher.id.toString()
                    });
                  }}
                >
                  عرض جميع كورسات المدرب
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <CourseEnrollVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        courseId={courseId!}
        onSuccess={handleVerificationSuccess}
      />
    </div>
  );
};

export default CourseDetails; 