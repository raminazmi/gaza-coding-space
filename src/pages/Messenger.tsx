import React, { useEffect, useRef, useState } from 'react';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/Loading';
import { Input } from '@/components/ui/input';
import { usePusher } from '@/context/PusherContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  FiSend,
  FiPaperclip,
  FiBook,
  FiBookOpen,
  FiWifi
} from 'react-icons/fi';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة${diffMin === 1 ? '' : ''}`;
  if (diffHour < 24) return `منذ ${diffHour} ساعة${diffHour === 1 ? '' : ''}`;
  if (diffDay < 7) return `منذ ${diffDay} يوم${diffDay === 1 ? '' : ''}`;

  return date.toLocaleString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

type Participant = {
  id: number;
  name: string;
  profile_photo_url?: string;
  isOnline?: boolean;
};

type Message = {
  id: string | number;
  conversation_id: number;
  user_id: number;
  body?: string | { file_name: string; file_size: number; mimetype: string; file_path: string };
  message?: string;
  created_at: string;
  created_date?: string;
  user?: Participant;
  is_temp?: boolean;
  file_name?: string;
  file_url?: string | { file_name: string; file_size: number; mimetype: string; file_path: string };
  isLoading?: boolean;
};

type Lecture = {
  id: number;
  name: string;
};

type Course = {
  id: number;
  name: string;
};

type Conversation = {
  id: number;
  participants: Participant[];
  last_message?: Message;
  updated_date?: string;
  new_messages?: number;
  lecture_id?: number;
  course_id?: number;
  lecture?: string;
  course?: string;
  discussion: Discussion;
};

type Discussion = {
  id: number;
  course_id: number;
  user_id: number;
  description: string;
  image: string | null;
  created_at: string;
  updated_at: string;
  lecture_id: number;
};

const Messenger = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [alertAudio] = useState<HTMLAudioElement>(new Audio('/assets/messenger.mp3'));
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = window.innerWidth < 768;
  const [authUser, setAuthUser] = useState<Participant | null>(null);
  const { echo, setTotalNewMessages } = usePusher();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibleConvs, setVisibleConvs] = useState(10);
  const [currentMsgPage, setCurrentMsgPage] = useState(1);
  const [hasMoreMsgs, setHasMoreMsgs] = useState(true);
  const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [lectureCache, setLectureCache] = useState<Record<number, string>>({});
  const [courseCache, setCourseCache] = useState<Record<number, string>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadstart = () => setPreviewImage('loading');
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.onerror = () => setPreviewImage(null);
      reader.readAsDataURL(file);
      setSelectedFile(file);
    } else {
      setSelectedFile(file || null);
    }
  };

  useEffect(() => {
    const alertAudio = new Audio('/assets/messenger.mp3');
    const onAudioEnded = () => {
      alertAudio.currentTime = 0;
    };
    alertAudio.addEventListener('ended', onAudioEnded);
    return () => {
      alertAudio.removeEventListener('ended', onAudioEnded);
    };
  }, []);

  useEffect(() => {
    if (selectedConv?.discussion?.lecture_id && selectedConv?.discussion?.course_id) {
      fetchLectureDetails(
        selectedConv.discussion.lecture_id,
        selectedConv.discussion.course_id
      );
      fetchCourseDetails(selectedConv.discussion.course_id);
    }
  }, [selectedConv]);

  const fetchAuthUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setAuthUser(data);
    } catch (e) { }
  };

  const fetchCourseDetails = async (courseId: number) => {
    if (!courseId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/course-details/${courseId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setCourseCache(prev => ({
          ...prev,
          [courseId]: data.course?.name || `الدورة ${courseId}`
        }));
      }
    } catch (e) { }
  };

  const fetchLectureDetails = async (lectureId: number, courseId: number) => {
    if (!lectureId || !courseId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/showLecture/${courseId}/${lectureId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setLectureCache(prev => ({
          ...prev,
          [lectureId]: data.lecture?.name || `المحاضرة ${lectureId}`
        }));
      }
    } catch (e) { }
  };

  const fetchConversations = async (page = 1) => {
    if (page === 1) setLoadingConvs(true);
    else setLoadingMore(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/conversations?page=${page}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();

      // استخراج قائمة المحادثات من البيانات
      const conversationsList = Array.isArray(data.data) ? data.data : data;

      // تحديث الكاشات للمحاضرات والدورات
      await Promise.all(
        conversationsList.map(async (conv: any) => {
          if (conv.discussion?.lecture_id) {
            await fetchLectureDetails(conv.discussion.lecture_id, conv.discussion.course_id);
          }
          if (conv.discussion?.course_id) {
            await fetchCourseDetails(conv.discussion.course_id);
          }
        })
      );

      // إنشاء المحادثات المحدثة مع أسماء المحاضرة والدورة
      const updatedConvs = conversationsList.map((conv: any) => {
        const lectureId = conv.discussion?.lecture_id;
        const courseId = conv.discussion?.course_id;
        return {
          ...conv,
          lecture: lectureId ? lectureCache[lectureId] || `المحاضرة ${lectureId}` : 'غير محددة',
          course: courseId ? courseCache[courseId] || `الدورة ${courseId}` : 'غير محددة',
        };
      });

      setConversations((prev) => (page === 1 ? updatedConvs : [...prev, ...updatedConvs]));
      const total = updatedConvs.reduce((sum, conv) => sum + (conv.new_messages || 0), 0);
      setTotalNewMessages(total);
      setHasMore(data.next_page_url !== null && data.next_page_url !== undefined);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConvs(false);
      setLoadingMore(false);
    }
  };

  const fetchMessages = async (convId: number, page = 1) => {
    if (page === 1) setLoadingMsgs(true);
    else setLoadingMoreMsgs(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/conversations/${convId}/messages?page=${page}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setError('تعذر تحميل الرسائل.');
        setMessages([]);
        setLoadingMsgs(false);
        setLoadingMoreMsgs(false);
        return;
      }
      const text = await res.text();
      const data = JSON.parse(text);
      if (data?.messages?.data && Array.isArray(data.messages.data)) {
        const formattedMessages = data.messages.data.map((msg: Message) => ({
          ...msg,
          created_date: formatDate(msg.created_at),
        })).reverse();
        setMessages((prev) => (page === 1 ? formattedMessages : [...formattedMessages, ...prev]));
        setHasMoreMsgs(!!data.messages.prev_page_url);
        setCurrentMsgPage(page);
      } else {
        if (page === 1) setMessages([]);
        setHasMoreMsgs(false);
      }
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الرسائل.');
      if (page === 1) setMessages([]);
      setHasMoreMsgs(false);
    } finally {
      setLoadingMsgs(false);
      setLoadingMoreMsgs(false);
    }
  };

  const markAsRead = async (convId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiBaseUrl}/api/conversations/${convId}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setConversations((prev) =>
        prev.map((conv) => (conv.id === convId ? { ...conv, new_messages: 0 } : conv))
      );
    } catch (err) { }
  };

  const currentConversationId = useRef<number | null>(null);

  useEffect(() => {
    currentConversationId.current = selectedConv?.id || null;
  }, [selectedConv]);

  useEffect(() => {
    if (!authUser || !echo) return;

    const channelName = `Messenger.${authUser.id}`;
    const channel = echo.join(channelName);

    // التحقق من عدم تكرار الاشتراك
    if (!channel.subscriptionCount) {
      console.log(`Subscribing to channel: ${channelName}`);
      channel.listen('.new-message', (data: any) => {
        const newMessage: Message = {
          ...data.message,
          created_date: formatDate(data.message.created_at),
          user: data.user,
          isNew: true,
        };

        if (data.message.user_id === authUser.id) return;

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === data.message.conversation_id) {
              const isForCurrentOpenConversation = currentConversationId.current === c.id;
              const newMessageCount = isForCurrentOpenConversation ? 0 : (c.new_messages || 0) + 1;
              const total = prev.reduce((sum, conv) => sum + (conv.id === c.id ? newMessageCount : conv.new_messages || 0), 0);
              setTotalNewMessages(total);
              return {
                ...c,
                last_message: {
                  ...c.last_message,
                  body: data.message.body,
                  created_date: formatDate(data.message.created_at),
                  id: data.message.id,
                  isNew: true,
                  conversation_id: c.id,
                },
                new_messages: newMessageCount,
              } as Conversation;
            }
            return c;
          })
        );

        if (currentConversationId.current === data.message.conversation_id) {
          markAsRead(data.message.conversation_id);
          const total = conversations.reduce((sum, conv) => sum + (conv.id === data.message.conversation_id ? 0 : conv.new_messages || 0), 0);
          setTotalNewMessages(total);
        }

        if (authUser && data.message.user_id !== authUser.id) {
          const alertAudio = new Audio('/assets/messenger.mp3');
          alertAudio.play().catch(() => console.log('Failed to play audio'));
          setTimeout(() => {
            alertAudio.pause();
            alertAudio.currentTime = 0;
          }, 1000);
        }
      });
    }

    // لا حاجة لإلغاء الاشتراك هنا، سيظل نشطًا طالما أن echo متصل
  }, [authUser, echo]);

  useEffect(() => {
    fetchAuthUser();
  }, []);

  useEffect(() => {
    if (authUser) {
      fetchConversations(1);
    }
  }, [authUser]);

  useEffect(() => {
    if (selectedConv?.id) {
      fetchMessages(selectedConv.id, 1);
      setCurrentMsgPage(1);
      setHasMoreMsgs(true);
      markAsRead(selectedConv.id);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? {
              ...c,
              new_messages: 0,
              last_message: c.last_message
                ? { ...c.last_message, isNew: false, conversation_id: c.id }
                : {
                  id: `temp-${Date.now()}`,
                  body: '',
                  created_at: new Date().toISOString(),
                  created_date: formatDate(new Date().toISOString()),
                  conversation_id: c.id,
                  user_id: authUser?.id || 0,
                  user: authUser || undefined,
                },
            }
            : c
        )
      );
    }
  }, [selectedConv]);

  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || !selectedConv || !authUser) return;

    const messageText = input;

    if (selectedFile && authUser) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          conversation_id: selectedConv.id,
          user_id: authUser.id,
          body: messageText || undefined,
          created_at: new Date().toISOString(),
          created_date: formatDate(new Date().toISOString()),
          user: authUser,
          is_temp: true,
          file_name: selectedFile.name,
          file_url: event.target?.result as string,
          isLoading: true,
        };

        setMessages((prev) => [...prev, tempMessage]);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedConv.id
              ? {
                ...c,
                last_message: {
                  ...c.last_message,
                  body: messageText,
                  created_date: formatDate(new Date().toISOString()),
                  id: tempMessage.id,
                  conversation_id: c.id,
                  created_at: new Date().toISOString(),
                  user_id: authUser?.id || 0,
                  user: authUser || undefined,
                },
              }
              : c
          )
        );

        setInput('');
        setSending(true);
        setError('');

        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('conversation_id', selectedConv.id.toString());
        if (messageText) formData.append('message', messageText);
        formData.append('attachment', selectedFile);

        try {
          const res = await fetch(`${apiBaseUrl}/api/messages`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: formData,
          });

          if (!res.ok) {
            throw new Error('Failed to send message');
          }

          const responseData = await res.json();
          if (responseData.message) {
            const realMessage: Message = {
              ...responseData.message,
              created_date: formatDate(responseData.message.created_at),
              user: authUser,
              is_temp: false,
              isLoading: false,
            };
            setMessages((prev) =>
              prev.map((msg) => (msg.id === tempMessage.id ? realMessage : msg))
            );
          }
        } catch (e) {
          setError('حدث خطأ أثناء إرسال الرسالة');
          setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConv.id
                ? {
                  ...c,
                  last_message: c.last_message,
                }
                : c
            )
          );
        } finally {
          setSending(false);
          setSelectedFile(null);
          setPreviewImage(null);
          setIsPreviewOpen(false);
        }
      };
      reader.readAsDataURL(selectedFile);
      return;
    }

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConv.id,
      user_id: authUser.id,
      body: messageText,
      created_at: new Date().toISOString(),
      created_date: formatDate(new Date().toISOString()),
      user: authUser,
      is_temp: true,
      isLoading: false,
    };
    setMessages((prev) => [...prev, tempMessage]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConv.id
          ? {
            ...c,
            new_messages: 0,
            last_message: c.last_message
              ? { ...c.last_message, isNew: false, conversation_id: c.id }
              : {
                id: `temp-${Date.now()}`,
                body: '',
                created_at: new Date().toISOString(),
                created_date: formatDate(new Date().toISOString()),
                conversation_id: c.id,
                user_id: authUser?.id || 0,
                user: authUser || undefined,
              },
          }
          : c
      )
    );

    setInput('');
    setSending(true);
    setError('');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('conversation_id', selectedConv.id.toString());
    formData.append('message', messageText);

    try {
      const res = await fetch(`${apiBaseUrl}/api/messages`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      const responseData = await res.json();
      if (responseData.message) {
        const realMessage: Message = {
          ...responseData.message,
          created_date: formatDate(responseData.message.created_at),
          user: authUser,
          is_temp: false,
          isLoading: false,
        };
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessage.id ? realMessage : msg
          )
        );
      }
    } catch (e) {
      setError('حدث خطأ أثناء إرسال الرسالة');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? {
              ...c,
              last_message: c.last_message,
            }
            : c
        )
      );
    } finally {
      setSending(false);
    }
  };

  const formatMessageCount = (count: number): string => {
    if (count === 0) return '';
    return `${count}`;
  };

  const handleSelectConv = async (conv: Conversation) => {
    if (selectedConv?.id === conv.id) return;

    if ((conv.new_messages ?? 0) > 0) {
      await markAsRead(conv.id);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conv.id
            ? {
              ...c,
              new_messages: 0,
              last_message: c.last_message
                ? { ...c.last_message, isNew: false, conversation_id: c.id }
                : {
                  id: `temp-${Date.now()}`,
                  body: '',
                  created_at: new Date().toISOString(),
                  created_date: formatDate(new Date().toISOString()),
                  conversation_id: c.id,
                  user_id: authUser?.id || 0,
                  user: authUser || undefined,
                },
            }
            : c
        )
      );
    }

    setSelectedConv(conv);
    if (isMobile) setShowSidebar(false);
  };

  const getOtherParticipant = (conv: Conversation): Participant | undefined => {
    return (conv.participants || []).find((p) => p.id !== authUser?.id) || conv.participants?.[0];
  };

  useEffect(() => {
    if (!isMobile) return;

    const header = document.querySelector<HTMLElement>('header');
    const bottomNav = document.querySelector<HTMLElement>('.bottom-nav');

    if (header) {
      header.style.display = selectedConv ? 'none' : '';
    }

    if (bottomNav) {
      document.body.style.paddingBottom = '56px';
      bottomNav.style.position = 'fixed';
      bottomNav.style.bottom = '0';
      bottomNav.style.left = '0';
      bottomNav.style.right = '0';
      bottomNav.style.zIndex = '50';
      bottomNav.style.backgroundColor = 'var(--background)';
      bottomNav.style.borderTop = '1px solid var(--border)';
    }

    return () => {
      if (header) {
        header.style.display = '';
      }
      document.body.style.paddingBottom = '';
    };
  }, [selectedConv, isMobile]);

  return (
    <div className="relative flex flex-col h-screen max-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="flex-1 flex flex-col md:flex-row items-start justify-start md:justify-center py-0 md:pt-4 md:pb-8 px-0 md:px-4 gap-4 w-full overflow-hidden">
        <div
          className={`${!selectedConv || showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-1/3 lg:w-1/4 max-w-full h-full md:h-[85vh] bg-white dark:bg-gray-800 shadow-lg rounded-none md:rounded-xl border border-gray-200 dark:border-gray-700 flex-shrink-0 flex-col transition-all duration-300 ease-in-out ${isMobile ? 'fixed inset-0 z-20' : 'relative'}`}
        >
          <CardHeader className="flex flex-row justify-start gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl py-4 px-4">
            <span className="mt-3 me-2 w-3 h-3 rounded-full bg-green-400 inline-block"></span>
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">الدردشة والاستفسارات</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {loadingMore && <div className="text-center py-2">جاري التحميل...</div>}
            {loadingConvs ? (
              <div className="flex justify-center items-center h-full">
                <Loading />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center text-gray-400 py-12">لا توجد محادثات بعد</div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                return (
                  <div
                    key={conv.id}
                    className={`flex items-center gap-3 px-4 py-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-primary/10 transition-all rounded-xl mx-2 my-1 ${selectedConv?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400' : ''}`}
                    style={{ minHeight: 64 }}
                    onClick={() => handleSelectConv(conv)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={other?.profile_photo_url} alt={other?.name} />
                      </Avatar>
                      {other?.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-bold text-gray-800 dark:text-gray-100 text-base truncate">
                          {other?.name || 'مستخدم'}
                        </div>
                        {other?.isOnline && (
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        )}
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-300 truncate flex items-center gap-1">
                        {conv.last_message?.file_name ? (
                          <>
                            <FiPaperclip className="flex-shrink-0" />
                            <span>{conv.last_message.file_name}</span>
                          </>
                        ) : typeof conv.last_message?.body === 'string' ? (
                          conv.last_message.body
                        ) : (
                          'ملف مرفق'
                        )}
                      </div>

                      <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-col mt-1">
                        <div className="flex items-center gap-1">
                          <FiBookOpen className="text-blue-500" size={12} />
                          <span className="font-semibold">
                            المحاضرة: {conv.lecture || 'غير محددة'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiBook className="text-purple-500" size={12} />
                          <span className="font-medium italic">
                            الدورة: {conv.course || 'غير محددة'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 min-w-[70px]">
                      <span className="text-xs text-gray-400">{conv.last_message?.created_date || conv.updated_date || ''}</span>
                      {(conv.new_messages ?? 0) > 0 && (
                        <Badge className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{formatMessageCount(conv.new_messages ?? 0)}</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </div>
        {selectedConv && (!isMobile || !showSidebar) && (
          <div className={`w-full h-full md:h-[85vh] shadow-lg rounded-none md:rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col relative transition-all duration-300 ${isMobile ? 'fixed inset-0 z-10' : 'relative'}`}>
            <div className="w-full sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:rounded-t-2xl py-3 px-4 flex items-center">
              {isMobile && (
                <button
                  className="text-gray-700 dark:text-gray-200 rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setShowSidebar(true);
                    setSelectedConv(null);
                  }}
                  aria-label="العودة لقائمة المحادثات"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                    <path d="M9 19l7-7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
              <div className="flex justify-between items-center gap-2 ">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
                      {getOtherParticipant(selectedConv)?.name || 'مستخدم'}
                    </h3>
                    {getOtherParticipant(selectedConv)?.isOnline && (
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </div>

                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    {getOtherParticipant(selectedConv)?.isOnline ? (
                      <>
                        <FiWifi className="text-green-500" />
                        <span>متصل الآن</span>
                      </>
                    ) : (
                      selectedConv.last_message?.created_date || selectedConv.updated_date || ''
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 flex flex-col mt-1">
                  <div className="flex items-center gap-1">
                    <FiBookOpen className="text-blue-500" size={12} />
                    <span className="font-semibold">المحاضرة: {selectedConv.lecture || 'غير محددة'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiBook className="text-purple-500" size={12} />
                    <span className="font-medium italic">الدورة: {selectedConv.course || 'غير محددة'}</span>
                  </div>
                </div>
              </div>
              {isMobile && <div className="w-8"></div>}
            </div>
            <div ref={chatContainerRef} className="flex-1 h-0 overflow-y-auto custom-scrollbar bg-[#e5ddd5] dark:bg-gray-900 bg-opacity-30 dark:bg-opacity-30" style={{ backgroundImage: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHBhdGggZmlsbD0iI2QxZDFkMSIgZD0iTTAgMGgxMDB2MTAwSDB6bTEwMCAwaDEwMHYxMDBIMTAwek0xMDAgMTAwaDEwMHYxMDBIMTAwek0wIDEwMGgxMDB2MTAwSDB6IiBvcGFjaXR5PSIwLjA1Ii8+PC9zdmc+")', backgroundSize: '200px 200px' }}>
              <CardContent className="px-2 py-4 md:px-6 md:py-6">
                {loadingMoreMsgs && <div className="text-center py-2">جاري تحميل المزيد...</div>}
                {loadingMsgs ? (
                  <div className="flex justify-center items-center h-full">
                    <Loading />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 dark:text-gray-300 py-12">لا توجد رسائل بعد</div>
                ) : (
                  [...messages]
                    .filter((msg) => msg.conversation_id === selectedConv?.id)
                    .map((msg) => {
                      const isAuth = msg.user_id === authUser?.id;
                      const isAttachment = typeof msg.body === 'object' && msg.body !== null && 'file_path' in msg.body;
                      const attachmentBody = isAttachment ? (msg.body as { file_name: string; file_path: string }) : null;
                      const isImage = (attachmentBody && /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentBody.file_name)) || (msg.is_temp && msg.file_url && typeof msg.file_url === 'string');
                      const fileUrl = msg.is_temp && typeof msg.file_url === 'string'
                        ? msg.file_url
                        : attachmentBody
                          ? `${apiBaseUrl}/storage/${attachmentBody.file_path}`
                          : msg.file_url;

                      return (
                        <div key={msg.id} className={`flex ${isAuth ? 'justify-start' : 'justify-end'} mb-4 items-end gap-2 transition-all`}>
                          <div
                            className={`max-w-[90vw] md:max-w-[60%] rounded-2xl px-3 py-2 text-sm break-words ${isAuth
                              ? 'bg-blue-500 text-white dark:bg-blue-600 rounded-br-none shadow-md'
                              : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'}`}
                            style={{ minHeight: 40 }}
                          >
                            {isImage ? (
                              <button
                                onClick={() => {
                                  setPopupImage(
                                    msg.is_temp && typeof msg.file_url === 'string'
                                      ? msg.file_url
                                      : typeof fileUrl === 'string'
                                        ? fileUrl
                                        : typeof fileUrl === 'object' && fileUrl?.file_path
                                          ? `${apiBaseUrl}/storage/${fileUrl.file_path}`
                                          : null
                                  );
                                  setIsPopupOpen(true);
                                }}
                                disabled={msg.isLoading}
                              >
                                {msg.isLoading ? (
                                  <div className="w-32 h-32 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-md">
                                    <Loading />
                                  </div>
                                ) : (
                                  <img
                                    src={
                                      msg.is_temp && typeof msg.file_url === 'string'
                                        ? msg.file_url
                                        : typeof fileUrl === 'string'
                                          ? fileUrl
                                          : typeof fileUrl === 'object' && fileUrl?.file_path
                                            ? `${apiBaseUrl}/storage/${fileUrl.file_path}`
                                            : '/placeholder.svg'
                                    }
                                    alt={attachmentBody?.file_name || msg.file_name || 'Image'}
                                    className="w-32 h-32 object-cover rounded-md cursor-pointer"
                                    onError={(e) => (e.currentTarget.src = '/placeholder.svg')}
                                  />
                                )}
                              </button>
                            ) : isAttachment ? (
                              <a
                                href={typeof fileUrl === 'string' ? fileUrl : '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center gap-2 ${isAuth ? 'text-white' : 'text-blue-600 dark:text-blue-400'} hover:underline`}
                              >
                                <FiPaperclip />
                                <span>{attachmentBody?.file_name || msg.file_name}</span>
                              </a>
                            ) : (
                              <div>{msg.body as string}</div>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
                <div ref={messagesEndRef} />
              </CardContent>
            </div>
            <form onSubmit={handleSend} className="flex gap-2 items-center p-2 px-2 md:px-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 md:rounded-b-2xl sticky bottom-0 z-10 shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.04)]" style={{ marginBottom: isMobile ? '48px' : '0' }}>
              <input
                type="file"
                id="chat-file-input"
                className="hidden"
                onChange={handleFileChange}
                title="إرفاق ملف"
                aria-label="إرفاق ملف"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
              />
              <label
                htmlFor="chat-file-input"
                className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="إرفاق ملف"
              >
                <FiPaperclip className="text-xl text-gray-600 dark:text-gray-300" />
              </label>
              {selectedFile && (
                <div className="flex items-center bg-blue-50 dark:bg-blue-900/30 rounded-lg px-2 py-1 mr-1">
                  <span className="text-xs text-blue-600 dark:text-blue-300 max-w-[80px] md:max-w-[120px] truncate">
                    {selectedFile.name}
                  </span>
                  <button
                    type="button"
                    name="selectedFile"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1"
                    aria-label="إزالة الملف"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <div className="flex-1 relative">
                <Input
                  type="text"
                  className="w-full border border-blue-200 dark:border-blue-900 rounded-xl pr-4 pl-12 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="اكتب رسالتك..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() || selectedFile) {
                        handleSend(e);
                      }
                    }
                  }}
                  disabled={sending}
                  dir="rtl"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <button
                type="submit"
                disabled={sending || (!input.trim() && !selectedFile)}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${((input.trim() || selectedFile) && !sending)
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                style={{ minWidth: '40px' }}
                aria-label="إرسال"
              >
                {sending ? (
                  <span className="loader w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <FiSend className="text-xl" />
                )}
              </button>
            </form>
            {error && <div className="text-center text-red-600 mt-2">{error}</div>}
          </div>
        )}
        {!selectedConv && (
          <div className="hidden md:flex flex-1 w-full items-center justify-center bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-screen md:h-[85vh]">
            <div className="text-center p-8 max-w-md">
              <div className="mx-auto w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">مرحباً بك في الرسائل</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">اختر محادثة من القائمة لبدء المحادثة</p>
            </div>
          </div>
        )}
        {isMobile && !selectedConv && (
          <div className="md:hidden flex-1 w-full">
            <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">الرسائل</h2>
            </div>
            <div className="p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">اختر محادثة لبدء المحادثة</p>
            </div>
          </div>
        )}
      </div>
      <div className="bottom-nav-container">
        <div id="bottom-nav-placeholder"></div>
      </div>
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>معاينة الصورة</DialogTitle>
          </DialogHeader>
          {previewImage === 'loading' ? (
            <div className="flex items-center justify-center w-32 h-32">
              <Loading />
            </div>
          ) : previewImage ? (
            <div className="flex flex-col items-center justify-center">
              <img
                src={previewImage}
                alt="معاينة"
                className="w-32 h-32 object-cover rounded-md"
              />
              <div className="flex justify-end gap-2 mt-4 w-full">
                <button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    setSelectedFile(null);
                    setPreviewImage(null);
                  }}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={(e) => {
                    setSending(true);
                    handleSend(e).then(() => setSending(false));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {sending ? 'جاري الارسال...' : 'إرسال الصورة'}
                </button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          {popupImage && <img src={popupImage} alt="معاينة مكبرة" className="w-full h-[73vh] object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messenger;