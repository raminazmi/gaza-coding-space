import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiChevronDown, FiChevronUp, FiSend, FiRefreshCw } from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';
import { apiBaseUrl } from '@/lib/utils';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { useAppSelector } from '@/hooks/useAppSelector';
import Loading from '@/components/ui/Loading';
import { useToast } from '@/components/ui/use-toast';

// دالة لتحويل status إلى نص مناسب
function getWatchStatusText(status?: string) {
  if (status === 'endWatch') return 'تمت المشاهدة';
  if (status === 'inProgress') return 'قيد المشاهدة';
  if (status === 'notStarted') return 'لم تبدأ بعد';
  return 'لم تشاهد بعد';
}

const LectureDetails = () => {
  const { courseId, lectureId } = useParams();
  const [lecture, setLecture] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [openDiscussionId, setOpenDiscussionId] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState(5);
  const isFirstLoad = React.useRef(true);

  const user = useAppSelector((state) => state.user.user);
  const currentUserId = user?.id;
  const [replyInputs, setReplyInputs] = useState<{ [discussionId: string]: string }>({});
  const [replySending, setReplySending] = useState<{ [discussionId: string]: boolean }>({});
  const messagesEndRefs = useRef<{ [discussionId: string]: HTMLDivElement | null }>({});
  const messagesContainerRefs = useRef<{ [discussionId: string]: HTMLDivElement | null }>({});

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const fetchWithAuth = (url: string) =>
      fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        .then(r => r.json());
    Promise.all([
      fetchWithAuth(`${apiBaseUrl}/api/showLecture/${courseId}/${lectureId}`),
      fetchWithAuth(`${apiBaseUrl}/api/LectureDetails/${courseId}/${lectureId}`),
    ]).then(([lectureRes, courseRes]) => {
      console.log('lectureRes.Lecture:', lectureRes.Lecture); // طباعة بيانات المحاضرة من الـ API
      setLecture(lectureRes.Lecture); // هذا يحفظ is_watch القادم من الداتابيز
      setCourse(courseRes.course);
      setChapters(courseRes.course?.chapters || []);
      setExpanded(courseRes.course?.chapters?.[0]?.id?.toString() || null);
      if (courseRes.course && courseRes.course.name) {
        localStorage.setItem('breadcrumb_course_name', courseRes.course.name);
      }
      if (lectureRes.Lecture && lectureRes.Lecture.name) {
        localStorage.setItem('breadcrumb_lecture_name', lectureRes.Lecture.name);
      }
    }).finally(() => setLoading(false));
  }, [courseId, lectureId]);

  const fetchDiscussions = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiBaseUrl}/api/discussions/${courseId}/${lectureId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    let allDiscussions = data.discussions || [];
    if (data.Mydiscussion) {
      const exists = allDiscussions.some((d: any) => d.id === data.Mydiscussion.id);
      if (!exists) {
        allDiscussions = [data.Mydiscussion, ...allDiscussions];
      }
    }
    setDiscussions(allDiscussions);
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
    setSuccessMsg('');
    setErrorMsg('');
    if (!input.trim() || input.trim().length < 10) {
      setErrorMsg('يجب أن يكون طول نص الوصف على الأقل 10 حروف/حرفًا');
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('description', input);
      formData.append('course_id', courseId!);
      formData.append('teacher_id', course?.teacher?.id || '');
      formData.append('lecture_id', lectureId!);
      const res = await fetch(`${apiBaseUrl}/api/post-discussion`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (data.message === 'تم') {
        setSuccessMsg('تم إرسال الاستفسار بنجاح');
        setInput('');
        await fetchDiscussions();
      } else {
        setErrorMsg('حدث خطأ أثناء الإرسال');
      }
    } catch (err) {
      setErrorMsg('حدث خطأ أثناء الإرسال');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (e: React.FormEvent, discussionId: string) => {
    e.preventDefault();
    const reply = replyInputs[discussionId]?.trim();
    if (!reply || reply.length < 1) return;
    const discussion = discussions.find(d => d.id === discussionId);
    const conversationId = discussion?.conversation?.id;
    if (!conversationId) {
      return;
    }
    setReplySending((prev) => ({ ...prev, [discussionId]: true }));
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('conversation_id', conversationId);
      formData.append('message', reply);
      formData.append('type', 'text');
      const res = await fetch(`${apiBaseUrl}/api/messages`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const responseData = await res.json();
      setReplyInputs((prev) => ({ ...prev, [discussionId]: '' }));
      await fetchDiscussions();
    } catch (err) {
      console.error('Error sending reply:', err);
    } finally {
      setReplySending((prev) => ({ ...prev, [discussionId]: false }));
    }
  };

  const handleVideoEnd = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('lecture_id', lectureId!);
      formData.append('course_id', courseId!);
      formData.append('status', 'endWatch');
      const res = await fetch(`${apiBaseUrl}/api/watch-Lecture`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      let data: any = null;
      try {
        data = await res.json();
      } catch (e) {
        data = { error: 'response is not JSON', status: res.status };
      }

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
      // تحديث حالة المشاهدة في lecture نفسه
      setLecture((prevLecture: any) =>
        prevLecture ? { ...prevLecture, is_watch: { ...prevLecture.is_watch, status: 'endWatch' } } : prevLecture
      );

      toast({ title: 'نجاح', description: 'تم تسجيل مشاهدة المحاضرة بنجاح' });
    } catch {
      toast({ title: 'خطأ', description: 'حدث خطأ أثناء تسجيل المشاهدة' });
    }
  };

  if (loading) return <div className="flex items-center justifiy-center min-h-screen"><Loading /></div>;
  if (!lecture || !course) return <div className="min-h-screen flex items-center justify-center">لم يتم العثور على البيانات</div>;

  // طباعة بيانات lecture عند كل render
  console.log('lecture.is_watch?.status (render):', lecture?.is_watch?.status);

  const hasMyDiscussionWithTeacher = discussions.some(d => {
    const isMyDiscussion = String(d.user?.id) === String(currentUserId);
    return isMyDiscussion;
  });

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

                  {/* Mobile Aside - Top */}
          <aside className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl mb-4 md:hidden">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">محتوى الدورة</h2>
          {chapters.length > 5 ? (
            <div className="overflow-y-auto max-h-[350px]">
              {chapters.map((chapter) => (
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
                      {chapter.lectures?.map((lec) => (
                        <li
                          key={lec.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${String(lec.id) === String(lectureId)
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:border-blue-900'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          onClick={() => navigate(`/courses/${courseId}/lecture/${lec.id}`)}
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
                          <span className={`text-sm truncate ${String(lec.id) === String(lectureId)
                              ? 'font-bold text-blue-700 dark:text-blue-300'
                              : 'text-gray-600 dark:text-gray-300'
                            }`}>
                            {lec.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {chapters.map((chapter) => (
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
                      {chapter.lectures?.map((lec) => (
                        <li
                          key={lec.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${String(lec.id) === String(lectureId)
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:border-blue-900'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          onClick={() => navigate(`/courses/${courseId}/lecture/${lec.id}`)}
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
                          <span className={`text-sm truncate ${String(lec.id) === String(lectureId)
                              ? 'font-bold text-blue-700 dark:text-blue-300'
                              : 'text-gray-600 dark:text-gray-300'
                            }`}>
                            {lec.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </>
          )}
          </aside>
          
          {!hasMyDiscussionWithTeacher && (
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
                                  {(discussion.user?.name || '').slice(0, 2)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="text-start flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-bold text-gray-800 dark:text-gray-100">{discussion.user?.name}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{discussion.description}</div>
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(discussion.created_at).toLocaleDateString('ar-EG')}
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
                                  {/* صورة أو رمز المستخدم */}
                                  {msg.user?.profile_photo_url ? (
                                    <img
                                      src={msg.user.profile_photo_url}
                                      alt={msg.user.name}
                                      className="w-8 h-8 rounded-xl object-cover border border-blue-100 dark:border-gray-700"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-xl flex items-center justify-center border border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800">
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-300 select-none">
                                        {(msg.user?.name || '').slice(0, 2)}
                                      </span>
                                    </div>
                                  )}
                                  {/* فقاعة الرسالة */}
                                  <div
                                    className={
                                      `max-w-[100%] rounded-2xl px-4 py-2 border ` +
                                      (msg.user?.id === currentUserId
                                        ? 'bg-blue-100 dark:bg-[#1a2236] text-gray-800 dark:text-white border-blue-200 dark:border-blue-800 rounded-tr-none'
                                        : 'bg-gray-100 dark:bg-[#23272f] text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 rounded-tl-none'
                                      )
                                    }
                                    style={msg.user?.id === currentUserId ? { backgroundColor: undefined } : { backgroundColor: undefined }}
                                  >
                                    <div className="text-sm">{msg.body}</div>
                                    <div className={`text-xs mt-1 ${msg.user?.id === currentUserId
                                      ? 'text-blue-600 dark:text-blue-200 text-left'
                                      : 'text-gray-500 dark:text-gray-300 text-right'
                                      }`}>
                                      {msg.user?.name}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-sm text-gray-500 py-3">
                                لا توجد ردود بعد
                              </div>
                            )}
                          </div>

                          {discussion.user?.id === currentUserId && (
                            <form
                              onSubmit={e => handleReply(e, discussion.id)}
                              className="flex gap-2 items-center mt-2"
                            >
                              <input
                                type="text"
                                placeholder="اكتب ردك هنا..."
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

        {/* Desktop Aside - Side */}
        <aside className="md:w-1/4 w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl mb-4 md:mb-0 md:sticky md:top-20 max-h-fit overflow-y-auto hidden md:block">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">محتوى الدورة</h2>
          {chapters.length > 5 ? (
            <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
              {chapters.map((chapter) => (
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
                      {chapter.lectures?.map((lec) => (
                        <li
                          key={lec.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${String(lec.id) === String(lectureId)
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:border-blue-900'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          onClick={() => navigate(`/courses/${courseId}/lecture/${lec.id}`)}
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

                          <span className={`text-sm truncate ${String(lec.id) === String(lectureId)
                            ? 'font-bold text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-300'
                            }`}>
                            {lec.name}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {chapters.map((chapter) => (
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
                      {chapter.lectures?.map((lec) => (
                        <li
                          key={lec.id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${String(lec.id) === String(lectureId)
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm dark:from-gray-800 dark:to-gray-900 dark:border-blue-900'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                          onClick={() => navigate(`/courses/${courseId}/lecture/${lec.id}`)}
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
                          <span className={`text-sm truncate ${String(lec.id) === String(lectureId)
                            ? 'font-bold text-blue-700 dark:text-blue-300'
                            : 'text-gray-600 dark:text-gray-300'
                            }`}>
                            {lec.name}
                          </span>
                        </li>
                      ))}
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