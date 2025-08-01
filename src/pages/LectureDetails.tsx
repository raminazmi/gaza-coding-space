import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiSend, FiRefreshCw, FiLock } from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';
import { apiBaseUrl } from '@/lib/utils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import useBreadcrumb from '@/hooks/useBreadcrumb';
import useAuth from '@/hooks/useAuth';
import Loading from '@/components/ui/Loading';
import { useToast } from '@/components/ui/use-toast';

function getWatchStatusText(status?: string) {
  if (status === 'endWatch') return 'تمت المشاهدة';
  if (status === 'inProgress') return 'قيد المشاهدة';
  if (status === 'notStarted') return 'لم تبدأ بعد';
  return 'لم تشاهد بعد';
}

// دالة مساعدة لمعالجة عرض محتوى الرسائل
function renderMessageContent(content: any) {
  try {
    if (typeof content === 'string') {
      return content;
    }

    if (typeof content === 'object' && content) {
      // إذا كان object يحتوي على file_name (ملف مرفق)
      if (content.file_name) {
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {content.file_name}
              </div>
              {content.file_size && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {(content.file_size / 1024 / 1024).toFixed(2)} MB
                </div>
              )}
            </div>
            {content.file_path && (
              <a
                href={content.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-sm"
              >
                تحميل
              </a>
            )}
          </div>
        );
      }

      // إذا كان object يحتوي على نص في حقل آخر
      if (content.text || content.message || content.content) {
        return content.text || content.message || content.content;
      }

      // إذا كان object فارغ أو غير معروف
      return 'رسالة غير مقروءة';
    }

    // إذا كان null أو undefined
    if (content === null || content === undefined) {
      return 'رسالة فارغة';
    }

    // إذا كان أي نوع آخر، نحاول تحويله إلى نص
    return String(content);
  } catch (error) {
    console.error('Error rendering message content:', error);
    return 'رسالة غير مقروءة';
  }
}

function renderLectureItem(lec: any, lectureId: string, courseId: string, enrollStatus: any, navigate: any, setIsNavigating?: any) {
  const isEnrolled = enrollStatus && enrollStatus.status === 'joined';
  const isShownToVisitors = lec.show === 1;
  const canAccess = isEnrolled || isShownToVisitors;

  return (
    <li
      key={lec.id}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${String(lec.id) === String(lectureId)
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:border-blue-900'
        : canAccess ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : 'opacity-60'
        }`}
      onClick={() => {
        if (!canAccess) {
          return;
        }
        if (setIsNavigating) {
          setIsNavigating(true);
        }
        navigate(`/courses/${courseId}/lecture/${lec.id}`);
      }}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${lec.is_watch?.status === 'endWatch'
        ? 'bg-green-500 border-green-500 text-white'
        : 'border-gray-300'
        }`}>
        {lec.is_watch?.status === 'endWatch' && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm truncate flex-1 ${String(lec.id) === String(lectureId)
        ? 'font-bold text-blue-700 dark:text-blue-300'
        : !canAccess ? 'text-gray-400 dark:text-gray-500'
          : 'text-gray-600 dark:text-gray-300'
        }`}>
        {lec.name}
        {isShownToVisitors && !isEnrolled && (
          <span className="mr-2 text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
            مجاني
          </span>
        )}
      </span>
      {!canAccess && (
        <FiLock className="text-gray-400 dark:text-gray-500 text-sm" />
      )}
    </li>
  );
}

const LectureDetails = () => {
  const { courseId, lectureId } = useParams();


  const [lecture, setLecture] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [enrollStatus, setEnrollStatus] = useState<any>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [openDiscussionId, setOpenDiscussionId] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(5);
  const [isNavigating, setIsNavigating] = useState(false);
  const isFirstLoad = React.useRef(true);

  const user = useAuth().user;
  const currentUserId = user?.id;


  const [replyInputs, setReplyInputs] = useState<{ [discussionId: string]: string }>({});
  const [replySending, setReplySending] = useState<{ [discussionId: string]: boolean }>({});
  const messagesEndRefs = useRef<{ [discussionId: string]: HTMLDivElement | null }>({});
  const messagesContainerRefs = useRef<{ [discussionId: string]: HTMLDivElement | null }>({});

  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCourse: setBreadcrumbCourse, setLecture: setBreadcrumbLecture } = useBreadcrumb();
  const { authService, getToken } = useAuth();



  useEffect(() => {
    if (isNavigating) {
      return;
    }

    setLoading(true);

    const loadData = async () => {
      try {
        const token = getToken();
        const [lectureRes, courseRes, enrollRes] = await Promise.all([
          authService.showLecture(courseId!, lectureId!),
          authService.getLectureDetails(courseId!, lectureId!),
          token ? authService.checkEnrollment(courseId!) : Promise.resolve(null),
        ]);

        if (lectureRes?.success && lectureRes.data) {
          setLecture(lectureRes.data.Lecture);

          if (lectureRes.data.Lecture?.name && lectureId) {
            setBreadcrumbLecture({
              name: lectureRes.data.Lecture.name,
              id: lectureId
            });
          }
        }

        if (courseRes?.success && courseRes.data) {
          setCourse(courseRes.data.course);
          setChapters(courseRes.data.course?.chapters || []);
          setExpanded(courseRes.data.course?.chapters?.[0]?.id?.toString() || null);

          if (courseRes.data.course?.name && courseId) {
            setBreadcrumbCourse({
              name: courseRes.data.course.name,
              id: courseId,
              teacherName: courseRes.data.course.teacher?.name || courseRes.data.course.user,
              teacherId: courseRes.data.course.teacher?.id?.toString()
            });
          }
        }

        if (enrollRes?.success && enrollRes.data) {
          setEnrollStatus(enrollRes.data.enrollStatus);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, lectureId, isNavigating]);

  const fetchDiscussions = async () => {
    try {
      const result = await authService.getDiscussions(courseId!, lectureId!);

      if (result.success && result.data) {
        let allDiscussions = result.data.discussions || [];

        if (result.data.Mydiscussion) {
          const exists = allDiscussions.some((d: any) => d.id === result.data.Mydiscussion.id);

          if (!exists) {
            // تأكد من وجود بيانات المستخدم - إذا لم تكن موجودة، استخدم البيانات الحالية
            let myDiscussion = { ...result.data.Mydiscussion };
            if (!myDiscussion.user || !myDiscussion.user.name) {
              myDiscussion.user = {
                id: currentUserId,
                name: user?.name || 'أنا',
                profile_photo_url: user?.profile_photo_url || null,
                ...myDiscussion.user // احتفظ بأي بيانات موجودة
              };
            }

            allDiscussions = [myDiscussion, ...allDiscussions];
          }
        }

        // التحقق من بيانات المستخدم لجميع المناقشات
        allDiscussions = allDiscussions.map((discussion: any) => {
          if (discussion.user?.id === currentUserId && (!discussion.user.name || discussion.user.name === '')) {
            return {
              ...discussion,
              user: {
                id: currentUserId,
                name: user?.name || 'أنا',
                profile_photo_url: user?.profile_photo_url || null,
                ...discussion.user
              }
            };
          }
          return discussion;
        });

        // معالجة آمنة للرسائل
        allDiscussions = allDiscussions.map((discussion: any) => {
          if (discussion.conversation?.messages) {
            discussion.conversation.messages = discussion.conversation.messages.map((msg: any) => {
              // التأكد من أن msg.body صالح للعرض
              if (msg.body && typeof msg.body === 'object' && !msg.body.file_name && !msg.body.text && !msg.body.message && !msg.body.content) {
                // إذا كان object غير معروف، نحوله إلى نص
                msg.body = JSON.stringify(msg.body);
              }
              return msg;
            });
          }
          return discussion;
        });

        allDiscussions.sort((a: any, b: any) => {
          if (a.user?.id === currentUserId) return -1;
          if (b.user?.id === currentUserId) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setDiscussions(allDiscussions);
      } else {
        setDiscussions([]);
      }
    } catch (error) {
      console.error('Error fetching discussions:', error);
      setDiscussions([]);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [courseId, lectureId]);

  useEffect(() => {
    if (chapters.length > 0 && lectureId) {
      const chapterWithLecture = chapters.find(ch =>
        ch.lectures?.some((lec: any) => String(lec.id) === String(lectureId))
      );
      if (chapterWithLecture) {
        setExpanded(chapterWithLecture.id);
      }
    }
  }, [chapters, lectureId]);

  useEffect(() => {
    if (discussions.length > 0 && !openDiscussionId) {
      setOpenDiscussionId(String(discussions[0].id));
    }
    if (isFirstLoad.current) {
      setVisibleCount(5);
      isFirstLoad.current = false;
    }
  }, [discussions, openDiscussionId]);

  useEffect(() => {
    if (!loading && isNavigating) {
      setIsNavigating(false);
    }
  }, [loading, isNavigating]);

  useEffect(() => {
    if (!openDiscussionId) return;
    const idx = discussions.findIndex(d => String(d.id) === String(openDiscussionId));
    if (idx >= 0 && visibleCount < idx + 1) {
      setVisibleCount(idx + 1);
    }
  }, [openDiscussionId, discussions]);

  useEffect(() => {
    if (openDiscussionId && messagesContainerRefs.current[openDiscussionId]) {
      const container = messagesContainerRefs.current[openDiscussionId];
      container.scrollTop = container.scrollHeight;
    }
  }, [discussions, openDiscussionId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!input.trim()) {
      return;
    }

    setSuccessMsg('');
    setErrorMsg('');
    setSending(true);
    try {
      const result = await authService.postDiscussion({
        description: input,
        course_id: courseId!,
        teacher_id: course?.teacher?.id || '',
        lecture_id: lectureId!,
      });

      if (result.success) {
        setSuccessMsg('تم إرسال الاستفسار بنجاح');
        setInput('');
        await fetchDiscussions();
      } else {
        setErrorMsg(result.message || 'حدث خطأ أثناء الإرسال');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء الإرسال');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e: React.FormEvent, discussionId: string) => {
    const discussion = discussions.find(d => d.id === discussionId);
    const isTeacherReplying = isCurrentUserTeacher && discussion?.user?.id !== currentUserId;

    e.preventDefault();

    const reply = replyInputs[discussionId]?.trim();

    if (!reply || reply.length < 1) {
      return;
    }

    const conversationId = discussion?.conversation?.id;

    if (!conversationId) {
      return;
    }
    setReplySending((prev) => ({ ...prev, [discussionId]: true }));
    try {
      const result = await authService.sendMessage(conversationId, reply);

      if (result.success) {
        setReplyInputs((prev) => ({ ...prev, [discussionId]: '' }));
        await fetchDiscussions();
      }
    } catch (err) {
      // Handle error silently
    } finally {
      setReplySending((prev) => ({ ...prev, [discussionId]: false }));
    }
  };

  const handleVideoEnd = async () => {
    try {
      const result = await authService.markLectureWatched(lectureId!, courseId!);

      if (result.success) {
        setChapters((prevChapters) =>
          prevChapters.map((chapter: any) => ({
            ...chapter,
            lectures: chapter.lectures.map((lec: any) =>
              String(lec.id) === String(lectureId)
                ? { ...lec, is_watch: { ...lec.is_watch, status: 'endWatch' } }
                : lec
            ),
          }))
        );

        setLecture((prevLecture: any) =>
          prevLecture ? { ...prevLecture, is_watch: { ...prevLecture.is_watch, status: 'endWatch' } } : prevLecture
        );

        toast({ title: 'نجاح', description: 'تم تسجيل مشاهدة المحاضرة بنجاح' });
      } else {
        toast({ title: 'خطأ', description: result.message || 'حدث خطأ أثناء تسجيل المشاهدة' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء تسجيل المشاهدة' });
    }
  };


  if (loading) {
    return <div className="flex items-center justifiy-center min-h-screen"><Loading /></div>;
  }

  if (!lecture || !course) {
    return <div className="min-h-screen flex items-center justify-center">لم يتم العثور على البيانات</div>;
  }

  const isEnrolled = enrollStatus && enrollStatus.status === 'joined';
  const shouldRestrictContent = !isEnrolled;

  const getFilteredChapters = () => {
    if (isEnrolled) {
      return chapters;
    }

    return chapters.map(chapter => ({
      ...chapter,
      lectures: chapter.lectures || []
    }));
  };

  const filteredChapters = getFilteredChapters();

  const hasMyDiscussion = discussions.some(d =>
    String(d.user?.id) === String(currentUserId)
  );

  // طرق متعددة لتحديد المعلم
  const teacherIdFromCourse = course?.teacher?.id;
  const teacherIdFromUser = course?.user_id;
  const teacherIdFromInstructor = course?.instructor_id;
  const teacherIdFromCreatedBy = course?.created_by;

  // التحقق من أن المستخدم الحالي هو المدرب بطرق متعددة
  const isCurrentUserTeacher = currentUserId && (
    (teacherIdFromCourse && String(currentUserId) === String(teacherIdFromCourse)) ||
    (teacherIdFromUser && String(currentUserId) === String(teacherIdFromUser)) ||
    (teacherIdFromInstructor && String(currentUserId) === String(teacherIdFromInstructor)) ||
    (teacherIdFromCreatedBy && String(currentUserId) === String(teacherIdFromCreatedBy))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="py-6 container max-w-6xl mx-auto flex flex-col md:flex-row gap-6 flex-1">
        <main className="md:w-3/4 w-full flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 md:p-4 flex flex-col gap-4 relative">
            {lecture.is_watch?.status === 'endWatch' && (
              <div className="absolute top-3 left-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full z-10 flex items-center">
                <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                تمت المشاهدة
              </div>
            )}
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
              <video
                controls
                className="w-full h-full object-cover"
                onEnded={handleVideoEnd}
              >
                <source src={lecture.videos} type="video/mp4" />
                متصفحك لا يدعم تشغيل الفيديو
              </video>
            </div>
            <div className="flex flex-col gap-1 px-1">
              <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                <FaRegUserCircle className="text-lg" />
                <span>{course.teacher?.name || course.user}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{lecture.name}</h1>
              <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                {lecture.timeLecture} • {getWatchStatusText(lecture.is_watch?.status)}
              </div>
            </div>
          </div>

          <aside className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl mb-4 md:hidden">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">محتوى الدورة</h2>
            {shouldRestrictContent && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 mb-4 border border-blue-200 dark:border-blue-800">
                <div className="text-center">
                  <div className="text-blue-600 dark:text-blue-300 font-semibold text-sm mb-2">
                    محتوى محدود
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">
                    يمكنك مشاهدة المحاضرات المفتوحة فقط. سجل في الدورة للوصول إلى جميع المحاضرات!
                  </div>
                </div>
              </div>
            )}
            {filteredChapters.length > 5 ? (
              <div className="overflow-y-auto max-h-[350px]">
                {filteredChapters.map((chapter) => (
                  <div key={chapter.id} className="mb-3">
                    <button
                      className="w-full flex justify-between items-center px-3 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 font-bold text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 mb-2 transition-all"
                      onClick={() => setExpanded(expanded === chapter.id ? null : chapter.id)}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{chapter.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-400">
                          ({chapter.lectures?.length || 0} محاضرة)
                        </span>
                      </div>
                      {expanded === chapter.id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    <div
                      className={`transition-all duration-300 overflow-hidden ${expanded === chapter.id ? 'max-h-96' : 'max-h-0'}`}
                      dir="rtl"
                    >
                      <ul className="space-y-1 px-1 pt-1">
                        {chapter.lectures?.length === 0 && (
                          <li className="text-xs text-gray-400 text-center py-2">لا يوجد محاضرات</li>
                        )}
                        {chapter.lectures?.map((lec) => renderLectureItem(lec, lectureId!, courseId!, enrollStatus, navigate, setIsNavigating))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredChapters.map((chapter) => (
                  <div key={chapter.id} className="mb-3">
                    <button
                      className="w-full flex justify-between items-center px-3 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 font-bold text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 mb-2 transition-all"
                      onClick={() => setExpanded(expanded === chapter.id ? null : chapter.id)}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{chapter.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-400">({chapter.lectures?.length || 0} محاضرة)</span>
                      </div>
                      {expanded === chapter.id ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                    <div
                      className={`transition-all duration-300 overflow-hidden ${expanded === chapter.id ? 'max-h-96' : 'max-h-0'}`}
                      style={{ direction: 'rtl' }}
                    >
                      <ul className="space-y-1 px-1 pt-1">
                        {chapter.lectures?.length === 0 && (
                          <li className="text-xs text-gray-400 text-center py-2">لا يوجد محاضرات</li>
                        )}
                        {chapter.lectures?.map((lec) => renderLectureItem(lec, lectureId!, courseId!, enrollStatus, navigate, setIsNavigating))}
                      </ul>
                    </div>
                  </div>
                ))}
              </>
            )}
          </aside>

          {!hasMyDiscussion && (
            <form onSubmit={handleSend} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-5 flex flex-col gap-4 border border-blue-100 dark:border-blue-900">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-base text-blue-800">إبدأ مناقشة مع المدرب</span>
                <span className="text-xs text-blue-600">{course.teacher?.name || course.user}</span>
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="اكتب استفسارك هنا..."
                  className="flex-1 border border-blue-200 dark:border-blue-900 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl w-12 h-12 flex items-center justify-center shadow-lg transition-all disabled:opacity-70"
                >
                  {sending ? (
                    <span className="loader w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <FiSend className="text-xl" />
                  )}
                </button>
              </div>
              {errorMsg && <div className="text-xs text-red-500 px-1">{errorMsg}</div>}
              {successMsg && <div className="text-xs text-green-600 px-1">{successMsg}</div>}
            </form>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="font-bold text-lg text-gray-800 dark:text-gray-100">استفسارات الطلبة</div>
              <button
                onClick={fetchDiscussions}
                className="text-blue-600 bg-blue-50 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-gray-900 px-3 py-2 rounded-lg shadow-sm flex items-center gap-1 transition-all"
              >
                <FiRefreshCw className="text-lg" />
                <span className="text-sm">تحديث</span>
              </button>
            </div>

            {discussions.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-300 py-6 flex flex-col items-center">
                <div className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                  <FiSend className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">لا توجد مناقشات بعد</p>
                <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">كن أول من يبدأ النقاش</p>
              </div>
            ) : (
              <>
                <Accordion type="single" collapsible value={openDiscussionId || undefined} onValueChange={setOpenDiscussionId} className="w-full">
                  {discussions.slice(0, visibleCount).map((discussion) => (
                    <AccordionItem
                      key={discussion.id}
                      value={String(discussion.id)}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <AccordionTrigger className="py-4 hover:no-underline">
                        <div className="flex items-start gap-4 w-full">
                          <div className="flex-shrink-0">
                            {discussion.user?.profile_photo_url ? (
                              <img
                                src={discussion.user.profile_photo_url}
                                alt={discussion.user?.name}
                                className="w-12 h-12 rounded-xl object-cover border border-blue-100 dark:border-gray-700"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800">
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-300 select-none">
                                  {discussion.user?.id === currentUserId
                                    ? (user?.name || 'أنا').slice(0, 2)
                                    : (discussion.user?.name || 'م').slice(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-start flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                  {typeof discussion.description === 'string'
                                    ? discussion.description
                                    : 'وصف غير متاح'
                                  }
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {discussion.created_at
                                  ? new Date(discussion.created_at).toLocaleDateString('ar-EG')
                                  : 'تاريخ غير متاح'
                                }
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4 w-full">
                        <div className="flex flex-col gap-4">
                          <div
                            ref={el => { messagesContainerRefs.current[discussion.id] = el; }}
                            className="max-h-72 overflow-y-auto pr-2"
                          >
                            {discussion.conversation?.messages && discussion.conversation.messages.length > 0 ? (
                              discussion.conversation.messages.map((msg: any, idx: number) => (
                                <div
                                  key={msg.id}
                                  ref={
                                    idx === discussion.conversation.messages.length - 1
                                      ? (el) => { messagesEndRefs.current[discussion.id] = el }
                                      : undefined
                                  }
                                  className={`flex ${msg.user?.id === currentUserId ? 'justify-end' : 'justify-start'} mb-3 items-center gap-2`}
                                >
                                  {msg.user?.id !== currentUserId && (
                                    <>
                                      {msg.user?.profile_photo_url ? (
                                        <img
                                          src={msg.user.profile_photo_url}
                                          alt={msg.user.name}
                                          className="w-8 h-8 rounded-xl object-cover border border-blue-100 dark:border-gray-700"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800">
                                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300 select-none">
                                            {(msg.user?.name || 'م').slice(0, 2)}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  )}

                                  <div
                                    className={
                                      `max-w-[80%] rounded-2xl px-4 py-2 border ` +
                                      (msg.user?.id === currentUserId
                                        ? 'bg-blue-100 dark:bg-[#1a2236] text-gray-800 dark:text-white border-blue-200 dark:border-blue-800 rounded-tr-none'
                                        : 'bg-gray-100 dark:bg-[#23272f] text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 rounded-tl-none'
                                      )
                                    }
                                  >
                                    <div className="text-sm">
                                      {renderMessageContent(msg.body)}
                                    </div>
                                    <div className={`text-xs mt-1 ${msg.user?.id === currentUserId
                                      ? 'text-blue-600 dark:text-blue-200 text-left'
                                      : 'text-gray-500 dark:text-gray-300 text-right'
                                      }`}>
                                      {msg.user?.id === currentUserId
                                        ? 'أنا'
                                        : (msg.user?.name || 'مستخدم')
                                      }
                                    </div>
                                  </div>

                                  {msg.user?.id === currentUserId && (
                                    <>
                                      {msg.user?.profile_photo_url ? (
                                        <img
                                          src={msg.user.profile_photo_url}
                                          alt={msg.user.name}
                                          className="w-8 h-8 rounded-xl object-cover border border-blue-100 dark:border-gray-700"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800">
                                          <span className="text-xs font-bold text-blue-600 dark:text-blue-300 select-none">
                                            {(user?.name || 'أنا').slice(0, 2)}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-sm text-gray-500 py-3">
                                لا توجد ردود بعد
                              </div>
                            )}
                          </div>

                          {(() => {
                            const ownsDiscussion = discussion.user?.id === currentUserId;
                            const canReply = ownsDiscussion || isCurrentUserTeacher;
                            const replyReason = ownsDiscussion ? 'يملك المناقشة' : isCurrentUserTeacher ? 'مدرب الكورس' : 'غير مخول';


                            return canReply;
                          })() && (
                              <form
                                onSubmit={e => handleReply(e, discussion.id)}
                                className="flex gap-2 items-center mt-2"
                              >
                                <input
                                  type="text"
                                  placeholder={
                                    isCurrentUserTeacher && discussion.user?.id !== currentUserId
                                      ? "اكتب ردك كمدرب..."
                                      : "اكتب ردك هنا..."
                                  }
                                  className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                                  value={replyInputs[discussion.id] || ''}
                                  onChange={e => setReplyInputs({ ...replyInputs, [discussion.id]: e.target.value })}
                                  disabled={replySending[discussion.id]}
                                />
                                <button
                                  type="submit"
                                  disabled={replySending[discussion.id]}
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-md transition-all disabled:opacity-50"
                                >
                                  {replySending[discussion.id] ? (
                                    <span className="loader w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    <FiSend className="text-lg" />
                                  )}
                                </button>
                              </form>
                            )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>

                {visibleCount < discussions.length && (
                  <button
                    className="mt-4 mx-auto block bg-white dark:bg-gray-800 text-blue-600 px-5 py-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-900 text-sm shadow-md border border-blue-100 dark:border-blue-900 transition-all"
                    onClick={() => setVisibleCount((prev) => Math.min(prev + 2, discussions.length))}
                  >
                    عرض المزيد من المناقشات
                  </button>
                )}
              </>
            )}
          </div>
        </main>

        <aside className="md:w-1/4 w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl mb-4 md:mb-0 md:sticky md:top-20 max-h-fit overflow-y-auto hidden md:block">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">محتوى الدورة</h2>
          {shouldRestrictContent && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 mb-4 border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="text-blue-600 dark:text-blue-300 font-semibold text-sm mb-2">
                  محتوى محدود
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  يمكنك مشاهدة المحاضرات المفتوحة فقط. سجل في الدورة للوصول إلى جميع المحاضرات!
                </div>
              </div>
            </div>
          )}
          {filteredChapters.length > 5 ? (
            <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
              {filteredChapters.map((chapter) => (
                <div key={chapter.id} className="mb-3">
                  <button
                    className="w-full flex justify-between items-center px-3 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 font-bold text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 mb-2 transition-all"
                    onClick={() => setExpanded(expanded === chapter.id ? null : chapter.id)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{chapter.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-400">({chapter.lectures?.length || 0} محاضرة)</span>
                    </div>
                    {expanded === chapter.id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${expanded === chapter.id ? 'max-h-96' : 'max-h-0'}`}
                    style={{ direction: 'rtl' }}
                  >
                    <ul className="space-y-1 px-1 pt-1">
                      {chapter.lectures?.length === 0 && (
                        <li className="text-xs text-gray-400 text-center py-2">لا يوجد محاضرات</li>
                      )}
                      {chapter.lectures?.map((lec) => renderLectureItem(lec, lectureId!, courseId!, enrollStatus, navigate, setIsNavigating))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredChapters.map((chapter) => (
                <div key={chapter.id} className="mb-3">
                  <button
                    className="w-full flex justify-between items-center px-3 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 font-bold text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100 mb-2 transition-all"
                    onClick={() => setExpanded(expanded === chapter.id ? null : chapter.id)}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm">{chapter.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-400">({chapter.lectures?.length || 0} محاضرة)</span>
                    </div>
                    {expanded === chapter.id ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${expanded === chapter.id ? 'max-h-96' : 'max-h-0'}`}
                    style={{ direction: 'rtl' }}
                  >
                    <ul className="space-y-1 px-1 pt-1">
                      {chapter.lectures?.length === 0 && (
                        <li className="text-xs text-gray-400 text-center py-2">لا يوجد محاضرات</li>
                      )}
                      {chapter.lectures?.map((lec) => renderLectureItem(lec, lectureId!, courseId!, enrollStatus, navigate, setIsNavigating))}
                    </ul>
                  </div>
                </div>
              ))}
            </>
          )}
        </aside>
      </div>
    </div>
  );
};

export default LectureDetails;