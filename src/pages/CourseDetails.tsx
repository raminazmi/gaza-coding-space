import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import defaultCourseImage from '@public/assests/webapplication.webp';

const CourseDetails = () => {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
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

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');

    fetch(`${apiBaseUrl}/api/course-details/${courseId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        setCourse(data.course || null);
        setIsFavorite(data.course?.is_favorite || false);
        if (data.course && data.course.name) {
          localStorage.setItem('breadcrumb_course_name', data.course.name);
        }
      })
      .finally(() => setLoading(false));

    if (token) {
      fetch(`${apiBaseUrl}/api/check-enroll/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.status) {
            setEnrollStatus(data.enrollStatus);
          }
        });
    }
  }, [courseId]);

  useEffect(() => {
    if (
      !didAutoExpand &&
      course &&
      course.chapters &&
      course.chapters.length > 0 &&
      expanded === null
    ) {
      setExpanded(String(course.chapters[0].id));
      setDidAutoExpand(true);
    }
  }, [course, expanded, didAutoExpand]);

  useEffect(() => {
    if (enrollStatus && enrollStatus.status === 'pending' && !showVerificationModal && !hasAutoShownModal) {
      setShowVerificationModal(true);
      setHasAutoShownModal(true);
    }
  }, [enrollStatus, showVerificationModal, hasAutoShownModal]);

  const toggleFavorite = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${apiBaseUrl}/api/toggle-favorite/${courseId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setIsFavorite(!isFavorite);
        }
      });
  };

  const handleEnroll = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setEnrollLoading(true);
    fetch(`${apiBaseUrl}/api/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ courseId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setShowVerificationModal(true);
          setIsPendingVerification(true);
          console.log('Enrollment initiated:', data.message);
        } else {
          throw new Error('فشل في بدء عملية التسجيل');
        }
      })
      .catch(error => {
        console.error('Enrollment error:', error);
      })
      .finally(() => setEnrollLoading(false));
  };

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    setIsPendingVerification(false);
    // Refresh enrollment status
    fetch(`${apiBaseUrl}/api/check-enroll/${courseId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setEnrollStatus(data.enrollStatus);
        }
      });
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
    // Show pending verification button if either enrollStatus is pending OR isPendingVerification is true
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

    if (enrollStatus && enrollStatus.status === 'joined') {
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
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diff = (now.getTime() - date.getTime()) / 1000;
    if (diff < 60) return 'الآن';
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
    if (diff < 2592000) return `منذ ${Math.floor(diff / 604800)} أسبوع`;
    if (diff < 31536000) return `منذ ${Math.floor(diff / 2592000)} شهر`;
    return `منذ ${Math.floor(diff / 31536000)} سنة`;
  }

  const courseImage = course?.image ? cleanMediaUrl(course.image) : defaultCourseImage;
  const headerBg = useDominantColorBackground(courseImage);

  if (loading) {
    return (
      <CourseDetailsSkeleton />
    );
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

  const chapters = course.chapters || [];
  const totalMinutes = (course.chapters || []).reduce((acc, chapter) =>
    acc + (chapter.lectures?.reduce((sum, lec) => sum + parseMinutes(lec.timeLecture), 0) || 0), 0
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/assets/images.jpeg';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="shadow text-white py-8" style={{ background: headerBg }}>
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/3 flex justify-center">
              {course.videos ? (
                <div className="relative w-full max-w-md rounded-xl overflow-hidden shadow-2xl">
                  <video className="w-full h-48 md:h-64 object-cover" poster={course.image ? cleanMediaUrl(course.image) : ''}>
                    <source src={cleanMediaUrl(course.videos)} type="video/mp4" />
                  </video>
                  <button
                    className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-30 hover:bg-opacity-40 transition-all"
                    onClick={() => navigate(`/courses/${courseId}/lecture/${course.chapters[0]?.lectures[0]?.id}`)}
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
                  <span>المدرب: {course.teacher ? course.teacher.name : course.user || '-'}</span>
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
                  <span>{course.chapters?.length || 0} محاضرة</span>
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

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="lg:w-2/3 w-full space-y-8">
            {/* Course Tabs */}
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
                        {/* Show limited content if not enrolled or pending */}
                        {(!enrollStatus || enrollStatus.status === 'pending') && course.salary !== 'مجاني' ? (
                          <>
                            {/* Show only first chapter with max 2 lectures */}
                            {chapters.slice(0, 1).map((chapter: any, idx) => (
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
                                      {Math.min(2, chapter.lectures?.length || 0)} من {chapter.lectures?.length || 0} محاضرة
                                    </span>
                                    {expanded === String(chapter.id) ? <FiChevronUp /> : <FiChevronDown />}
                                  </div>
                                </button>

                                <div
                                  className={`transition-all duration-300 overflow-hidden ${expanded === String(chapter.id) ? 'max-h-screen' : 'max-h-0'}`}
                                >
                                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {/* Show only first 2 lectures */}
                                    {chapter.lectures?.slice(0, 2).map((lec: any, index: number) => (
                                      <li
                                        key={lec.id}
                                        className="flex items-center justify-between px-5 py-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() => navigate(`/courses/${courseId}/lecture/${lec.id}`)}
                                      >
                                        <div className="flex items-center gap-3">
                                          <div className="w-6 h-6 flex items-center justify-center">
                                            {renderLectureIcon(lec.type)}
                                          </div>
                                          <span className="text-sm text-gray-700 dark:text-gray-100">
                                            {index + 1}. {lec.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-500 dark:text-gray-300">
                                            {lec.timeLecture || '00:00'}
                                          </span>
                                          <FiPlay className="text-blue-500" />
                                        </div>
                                      </li>
                                    ))}
                                    
                                    {/* Show enrollment message for remaining lectures */}
                                    {chapter.lectures?.length > 2 && (
                                      <li className="px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                                        <div className="text-center">
                                          <FiLock className="mx-auto text-2xl text-blue-600 dark:text-blue-400 mb-2" />
                                          <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                                            {chapter.lectures.length - 2} محاضرة إضافية متاحة
                                          </p>
                                          <p className="text-xs text-blue-600 dark:text-blue-400">
                                            سجل في الكورس لمشاهدة جميع المحاضرات
                                          </p>
                                        </div>
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            ))}
                            
                            {/* Show message for remaining chapters */}
                            {chapters.length > 1 && (
                              <div className="border border-blue-200 dark:border-blue-800 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 text-center">
                                <FiLock className="mx-auto text-3xl text-blue-600 dark:text-blue-400 mb-3" />
                                <h4 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">
                                  {chapters.length - 1} فصل إضافي متاح
                                </h4>
                                <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                                  اكتشف المزيد من المحتوى الرائع بعد التسجيل في الكورس
                                </p>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {chapters.slice(1, 4).map((chapter: any, idx) => (
                                    <span key={chapter.id} className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300 border border-blue-200 dark:border-blue-800">
                                      {chapter.name}
                                    </span>
                                  ))}
                                  {chapters.length > 4 && (
                                    <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300 border border-blue-200 dark:border-blue-800">
                                      +{chapters.length - 4} المزيد
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          /* Show full content for enrolled users */
                          chapters.map((chapter: any, idx) => (
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
                                {chapter.lectures?.map((lec: any, index: number) => (
                                  <li
                                    key={lec.id}
                                    className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${lec.is_watch ? 'bg-green-50 dark:bg-green-900/30' : ''}`}
                                    onClick={() => {
                                      if (!enrollStatus && course.salary !== 'مجاني') {
                                        return;
                                      }
                                      navigate(`/courses/${courseId}/lecture/${lec.id}`);
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-6 h-6 flex items-center justify-center">
                                        {renderLectureIcon(lec.type)}
                                      </div>
                                      <span className={`text-sm ${!enrollStatus && course.salary !== 'مجاني' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-100'}`}>
                                        {index + 1}. {lec.name}
                                        {lec.is_watch && (
                                          <span className="mr-2 text-xs bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300 px-2 py-0.5 rounded-full">
                                            تمت المشاهدة
                                          </span>
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500 dark:text-gray-300">
                                        {lec.timeLecture || '00:00'}
                                      </span>
                                      {!enrollStatus && course.salary !== 'مجاني' ? (
                                        <FiLock className="text-gray-400 dark:text-gray-500" />
                                      ) : (
                                        <FiPlay className="text-blue-500" />
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))
                        )}
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
                      {course.learnings?.length > 0 ? (
                        course.learnings.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <BsPatchCheck className="text-green-500 mt-1" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 dark:text-gray-300">لا يوجد معلومات عن المحتوى التعليمي</li>
                      )}
                    </ul>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-8 mb-4">متطلبات الكورس</h3>
                    <ul className="space-y-2">
                      {course.requirements?.length > 0 ? (
                        course.requirements.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <BsBookmarkCheck className="text-blue-500 mt-1" />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 dark:text-gray-300">لا يوجد متطلبات مسبقة</li>
                      )}
                    </ul>
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

            {/* Instructor Section */}
            {course.teacher && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">عن المدرب</h3>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4 flex justify-center">
                    <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {course.teacher.avatar ? (
                        <img
                          src={cleanMediaUrl(course.teacher.avatar)}
                          alt={course.teacher.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="text-4xl text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                  </div>
                  <div className="md:w-3/4 space-y-4">
                    <div>
                      <h4 className="text-lg font-bold dark:text-gray-100">{course.teacher.name}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{course.teacher.title || 'مدرب محترف'}</p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-blue-500" />
                        <span>{course.teacher.students_count || 0} طالب</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiBookOpen className="text-blue-500" />
                        <span>{course.teacher.courses_count || 0} كورس</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiStar className="text-blue-500" />
                        <span>التقييم: {course.teacher.rating || 'غير متاح'}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 dark:text-gray-200 leading-relaxed">
                      {course.teacher.bio || 'لا يوجد وصف متاح للمدرب.'}
                    </p>

                    <button
                      className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                      onClick={() => navigate(`/instructor/${course.teacher.id}`)}
                    >
                      عرض جميع كورسات المدرب
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Sidebar */}
          <aside className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl shadow-xl mb-4 md:mb-0 md:sticky md:top-20 max-h-fit overflow-y-auto">
            {/* Course Card */}
            <div className="overflow-hidden">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100">سعر الكورس</h3>
                  <span className="text-xl md:text-2xl font-bold text-blue-600">
                    {course.salary ? `${course.salary} $` : 'مجاني'}
                  </span>
                </div>

                {renderEnrollButton()}

                <button className="w-full mt-3 border border-blue-500 text-blue-500 py-2 md:py-3 rounded-lg font-bold hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex items-center justify-center gap-2 text-sm md:text-base" title="مشاركة الكورس">
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
                    <span className="font-medium">{course.chapters?.length || 0}</span>
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
                      {timeAgo(course.updated_at || course.updatedAt)}
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
                        >
                          <FiDownload />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Certificate Info */}
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

            {/* Enrollment Status */}
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

      {/* Course Enrollment Verification Modal */}
      <CourseEnrollVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        courseId={courseId!}
        onSuccess={handleVerificationSuccess}
      />
    </div >
  );
};

export default CourseDetails;