import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import Pusher from 'pusher-js';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/Loading';
import { Input } from '@/components/ui/input';
import { FiSend } from 'react-icons/fi';
import { FiPaperclip } from 'react-icons/fi';

// نقل دالة formatDate إلى هنا (أعلى الملف)
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Messenger = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = window.innerWidth < 768;
  const [authUser, setAuthUser] = useState<any>(null);
  const pusherRef = useRef<any>(null);
  const channelsRef = useRef<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  console.log('messages:', messages);
  // تهيئة Pusher
  useEffect(() => {
    pusherRef.current = new Pusher('8a691dd97a7cb6368d0b', {
      cluster: 'ap2',
      forceTLS: true
    });
    return () => {
      pusherRef.current?.disconnect();
    };
  }, []);
  
  // جلب المحادثات
  const fetchConversations = async () => {
    setLoadingConvs(true);
    const token = localStorage.getItem('token');
    const res = await fetch(`${apiBaseUrl}/api/conversations`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    setConversations(Array.isArray(data) ? data : []);
    setLoadingConvs(false);
    // إذا لم يتم اختيار محادثة بعد وهناك محادثات، اختر الأولى تلقائياً
    if ((!selectedConv || !selectedConv.id) && Array.isArray(data) && data.length > 0) {
      setSelectedConv(data[0]);
      fetchMessages(data[0].id);
    }
  };

  // جلب الرسائل
  const fetchMessages = async (convId: number) => {
    setLoadingMsgs(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/conversations/${convId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setError('تعذر تحميل الرسائل.');
        setMessages([]);
        setLoadingMsgs(false);
        return;
      }
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data && data.messages && Array.isArray(data.messages.data)) {
          const formattedMessages = data.messages.data.map((msg: any) => ({
            ...msg,
            created_date: formatDate(msg.created_at)
          }));
          setMessages(formattedMessages);
        } else {
          setMessages([]);
        }
      } catch (e) {
        setError('استجابة غير متوقعة من الخادم.');
        setMessages([]);
      }
    } catch (e) {
      setError('حدث خطأ أثناء تحميل الرسائل.');
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // تحديث القراءة
  const markAsRead = async (convId: number) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiBaseUrl}/api/conversations/${convId}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setConversations(prev => prev.map(conv => conv.id === convId ? { ...conv, new_messages: 0 } : conv));
    } catch (err) { }
  };


  // الاشتراك في قنوات المحادثات - تم التعديل
  useEffect(() => {
    if (!pusherRef.current) return;
    
    // فصل القنوات القديمة
    channelsRef.current.forEach(channel => {
      channel.unbind('new-message');
      pusherRef.current.unsubscribe(channel.name);
    });
    
    channelsRef.current = [];
    
    conversations.forEach(conv => {
      const channel = pusherRef.current.subscribe(`conversation.${conv.id}`);
      
      channel.bind('new-message', (data: any) => {
        console.log('new message from pusher', data);
        const newMessage = {
          ...data.message,
          created_date: formatDate(data.message.created_at),
          user: data.user
        };
        
        setMessages(prev => {
          // إزالة الرسالة المؤقتة إن وجدت
          const filtered = prev.filter(msg => !msg.id.startsWith('temp-'));
          return [...filtered, newMessage];
        });
        
        if (selectedConv?.id === data.message.conversation_id) {
          markAsRead(selectedConv.id);
        }
        
        setConversations(prev => prev.map(c => {
          if (c.id === data.message.conversation_id) {
            return {
              ...c,
              last_message: {
                ...c.last_message,
                body: data.message.body,
                created_date: formatDate(data.message.created_at)
              },
              new_messages: c.id === selectedConv?.id ? 0 : (c.new_messages || 0) + 1
            };
          }
          return c;
        }));
      });
      
      channelsRef.current.push(channel);
    });
    
    return () => {
      channelsRef.current.forEach(channel => {
        channel.unbind('new-message');
        pusherRef.current.unsubscribe(channel.name);
      });
    };
  }, [conversations, selectedConv]); // إضافة selectedConv كاعتمادية

  // دالة لجلب بيانات المستخدم
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
    } catch (e) {
      // يمكن إضافة معالجة خطأ هنا
    }
  };

  // جلب بيانات المستخدم عند تحميل الصفحة
  useEffect(() => {
    fetchAuthUser();
  }, []);

  // عند تحميل المحادثات، انتظر حتى يتم جلب بيانات المستخدم
  useEffect(() => {
    if (authUser) fetchConversations();
    // eslint-disable-next-line
  }, [authUser]);

  // عند تغيير المحادثة المختارة جلب الرسائل وتحديث القراءة
  useEffect(() => {
    if (selectedConv?.id) {
      fetchMessages(selectedConv.id);
      markAsRead(selectedConv.id);
    }
    // eslint-disable-next-line
  }, [selectedConv]);

  // التمرير إلى أحدث رسالة
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        try {
          const endRef = messagesEndRef.current;
          const container = chatContainerRef.current;
          if (endRef && container) {
            const scrollPosition = endRef.offsetTop - container.offsetTop;
            container.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          }
        } catch (e) {
          // تجاهل الخطأ أو أضف log إذا أردت
        }
      }, 50);
    }
  }, [messages]);

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  // عند إرسال رسالة - تم التعديل
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || !selectedConv || !authUser) return;
    // إضافة رسالة مؤقتة (مع اسم الملف إن وجد)
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConv.id,
      user_id: authUser.id,
      body: input,
      created_at: new Date().toISOString(),
      created_date: formatDate(new Date().toISOString()),
      user: authUser,
      is_temp: true,
      file_name: selectedFile?.name || undefined
    };
    setMessages(prev => [...prev, tempMessage]);
    setInput('');
    setSending(true);
    setError('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('conversation_id', selectedConv.id.toString());
    formData.append('message', input);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }
    try {
      const res = await fetch(`${apiBaseUrl}/api/messages`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        setError('حدث خطأ أثناء إرسال الرسالة');
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      }
    } catch (e) {
      setError('حدث خطأ أثناء إرسال الرسالة');
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setSending(false);
      setSelectedFile(null);
    }
  };

  const handleSelectConv = (conv: any) => {
    setSelectedConv(conv);
    if (isMobile) setShowSidebar(false);
  };

  // تحديث getOtherParticipant ليستخدم authUser?.id
  const getOtherParticipant = (conv: any) => {
    return (conv.participants || []).find((p: any) => p.id !== authUser?.id) || conv.participants?.[0];
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center py-4 md:py-8 px-2 md:px-12" dir="rtl">
      {(!selectedConv || showSidebar) && (
        <Card
          className="w-full md:w-1/4 max-w-full md:max-w-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col h-[90vh] mb-4 md:mb-0"
          style={{ zIndex: 20 }}
        >
          <CardHeader className="flex flex-row items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl p-4">
            <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">الدردشة والاستفسارات</CardTitle>
            <span className="ml-auto w-3 h-3 rounded-full bg-green-400 inline-block"></span>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
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
                    <Avatar>
                      <AvatarImage src={other?.profile_photo_url} alt={other?.name} />
                      <AvatarFallback>{(other?.name || 'م').slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-gray-800 dark:text-gray-100 text-base truncate">{other?.name || 'مستخدم'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 truncate">
                        {conv.last_message?.file_name
                          ? <span className="flex items-center gap-1"><FiPaperclip />{conv.last_message.file_name}</span>
                          : conv.last_message?.body || 'لا توجد رسائل بعد'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 min-w-[70px]">
                      <span className="text-xs text-gray-400">{conv.last_message?.created_date || conv.updated_date || ''}</span>
                      {conv.new_messages > 0 && (
                        <Badge className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{conv.new_messages}</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      )}
      {selectedConv && (!isMobile || !showSidebar) && (
        <Card className="flex-1 w-full max-w-3/4 mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[85vh] relative transition-all duration-300">
          {isMobile && (
            <button
              className="absolute top-4 left-4 z-30 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full w-10 h-10 flex items-center justify-center shadow-md border border-blue-200 dark:border-blue-700"
              onClick={() => setShowSidebar(true)}
              title="العودة لقائمة المحادثات"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          )}
          <CardHeader className="flex flex-row items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl p-4">
            <Avatar>
              <AvatarImage src={getOtherParticipant(selectedConv)?.profile_photo_url} alt={getOtherParticipant(selectedConv)?.name} />
              <AvatarFallback>{(getOtherParticipant(selectedConv)?.name || 'م').slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="font-bold text-gray-800 dark:text-gray-100 text-base">{getOtherParticipant(selectedConv)?.name || 'مستخدم'}</CardTitle>
              <div className="text-xs text-gray-400">{selectedConv.last_message?.created_date || selectedConv.updated_date || ''}</div>
            </div>
          </CardHeader>
          <div
            ref={chatContainerRef}
            className="flex-1 h-0 overflow-y-auto custom-scrollbar"
          >
            <CardContent className="px-2 py-4 md:px-6 md:py-6" style={{ background: 'transparent' }}>
              {loadingMsgs ? (
                <div className="flex justify-center items-center h-full">
                  <Loading />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-300 py-12">لا توجد رسائل بعد</div>
              ) : (
                <>
                  {[...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((msg: any) => {
                    const isAuth = msg.user_id === authUser?.id;
                    
                    // تحديد نمط الرسالة بناءً على المرسل
                    const messageStyle = isAuth 
                      ? 'bg-blue-500 text-white dark:bg-blue-600 rounded-tr-none shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none shadow-sm';
                    
                    // تحديد اتجاه الصورة بناءً على المرسل
                    const avatarPosition = isAuth 
                      ? <Avatar className="flex-shrink-0">
                          <AvatarImage src={msg.user?.profile_photo_url} alt={msg.user?.name} />
                          <AvatarFallback>{(msg.user?.name || 'م').slice(0, 1)}</AvatarFallback>
                        </Avatar>
                      : null;
                    
                    const textPosition = !isAuth 
                      ? <Avatar className="flex-shrink-0">
                          <AvatarImage src={msg.user?.profile_photo_url} alt={msg.user?.name} />
                          <AvatarFallback>{(msg.user?.name || 'م').slice(0, 1)}</AvatarFallback>
                        </Avatar>
                      : null;
                    
                    return (
                        <div key={msg.id} className={`flex ${isAuth ? 'justify-start' : 'justify-end'} mb-4 items-center gap-2 transition-all`}>
                        {/* صورة المرسل على اليسار */}
                        {isAuth && (
                          <Avatar className="flex-shrink-0">
                            <AvatarImage src={msg.user?.profile_photo_url} alt={msg.user?.name} />
                            <AvatarFallback>{(msg.user?.name || 'م').slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        )}
                        {/* رسالة المستقبل على اليسار */}
                        <div
                          className={
                            `max-w-[90vw] md:max-w-[60%] rounded-2xl px-4 py-2 text-sm break-words ` +
                            (isAuth
                              ? 'bg-blue-500 text-white dark:bg-blue-600 rounded-tr-none shadow-md'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-none shadow-sm'
                            )
                          }
                          style={{ minHeight: 40 }}
                        >
                          <div>{msg.message || msg.body}</div>
                          {/* عرض الملف إذا وجد */}
                          {msg.file_url && (
                            <div className="mt-2">
                              <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                                <FiPaperclip />
                                {msg.file_name || 'ملف مرفًق'}
                              </a>
                              {/* إذا كاًن صورة */}
                              {msg.file_url.match(/\.(jpg|jpeg|png|gif)$/i) && (
                                <img src={msg.file_url} alt={msg.file_name} className="max-w-xs mt-2 rounded" />
                              )}
                            </div>
                          )}
                          <div className={`text-xs mt-1 ${isAuth
                            ? 'text-blue-100 dark:text-blue-200 text-left'
                            : 'text-gray-500 dark:text-gray-300 text-right'
                            }`}>
                            {msg.created_date}
                          </div>
                        </div>
                        {/* صورة المستقبل على اليمين */}
                        {!isAuth && (
                          <Avatar className="flex-shrink-0">
                            <AvatarImage src={msg.user?.profile_photo_url} alt={msg.user?.name} />
                            <AvatarFallback>{(msg.user?.name || 'م').slice(0, 1)}</AvatarFallback>
                          </Avatar>
                        )}

                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>
          </div>
          <form onSubmit={handleSend} className="flex gap-2 items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl sticky bottom-0 z-10 shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.04)]">
            {/* زر اختيار ملف */}
            <input
              type="file"
              id="chat-file-input"
              className="hidden"
              onChange={e => setSelectedFile(e.target.files?.[0] || null)}
              title="إرفاق ملف"
              placeholder="اختر ملفًا لإرساله"
              aria-label="إرفاق ملف"
            />
            <label htmlFor="chat-file-input" className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 mr-2">
              <FiPaperclip className="text-xl text-gray-600 dark:text-gray-300" />
            </label>
            {selectedFile && (
              <span className="text-xs text-blue-600 dark:text-blue-300 max-w-[100px] truncate">{selectedFile.name}</span>
            )}
            <Input
              type="text"
              className="flex-1 border border-blue-200 dark:border-blue-900 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="اكتب رسالتك..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={sending}
              dir="rtl"
              style={{ minHeight: 48 }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl w-14 h-14 flex items-center justify-center shadow-lg transition-all disabled:opacity-70 text-2xl"
              style={{ minWidth: 56, minHeight: 56 }}
            >
              {sending ? (
                <span className="loader w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <FiSend className="text-2xl" />
              )}
            </button>
          </form>
          {error && <div className="text-center text-red-600 mt-2">{error}</div>}
        </Card>
      )}
      {!selectedConv && !showSidebar && (
        <div className="flex-1 w-full max-w-3xl mx-auto flex items-center justify-center h-[85vh]">
          <div className="text-xl text-gray-400 dark:text-gray-300 font-bold text-center">اختر أي محادثة للبدء</div>
        </div>
      )}
    </div>
  );
};

export default Messenger;