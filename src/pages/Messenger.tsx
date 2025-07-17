import React, { useEffect, useRef, useState } from 'react';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FiSend } from 'react-icons/fi';

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
  const [authId] = useState(() => Number(localStorage.getItem('user_id')));
  const [authName] = useState(() => localStorage.getItem('user_name') || '');
  const [authPhoto] = useState(() => localStorage.getItem('user_photo_url') || '');

  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConvs(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${apiBaseUrl}/api/conversations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
      setLoadingConvs(false);
    };
    fetchConversations();
  }, []);

  // أضف useEffect جديد لمراقبة conversations وتعيين أول محادثة دائماً إذا لم تكن هناك محادثة مختارة
  useEffect(() => {
    if ((!selectedConv || !selectedConv.id) && conversations.length > 0) {
      setSelectedConv(conversations[0]);
      fetchMessages(conversations[0].id);
    }
    // eslint-disable-next-line
  }, [conversations]);

  const fetchMessages = async (convId: number) => {
    // لا تعرض لودينج عند التحديث
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/conversations/${convId}/messages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setError('تعذر تحميل الرسائل.');
        setMessages([]);
        return;
      }
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data && data.messages && Array.isArray(data.messages.data)) {
          // تحويل التواريخ إلى الصيغة المطلوبة
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
    }
  };

  // تنسيق التاريخ بالشكل العربي المطلوب: يوم/شهر/سنة ساعة:دقيقة
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

  // التمرير إلى أحدث رسالة في منطقة المحادثة فقط
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current && chatContainerRef.current) {
      // حساب موضع التمرير
      const container = chatContainerRef.current;
      const scrollPosition = messagesEndRef.current.offsetTop - container.offsetTop;
      
      // التمرير السلس مع التحكم في المنطقة
      container.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  useEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  // تعريف دالة جلب المحادثات لتكون متاحة في كل مكان
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConv) return;
    setSending(true);
    setError('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('conversation_id', selectedConv.id);
    formData.append('message', input);
    try {
      // إضافة الرسالة الجديدة مباشرة بنفس بيانات auth (يمين، فقاعة زرقاء)
      const now = new Date();
      const formattedDate = formatDate(now.toISOString());
      const newMessage = {
        id: Math.random().toString(36).slice(2), // id مؤقت
        user_id: authId,
        user: {
          name: authName,
          profile_photo_url: authPhoto,
        },
        message: input,
        body: input,
        created_at: now.toISOString(),
        created_date: formattedDate,
        isLocal: true
      };
      setMessages(prev => [...prev, newMessage]);
      const res = await fetch(`${apiBaseUrl}/api/messages`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        setError('حدث خطأ أثناء إرسال الرسالة');
        setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
      } else {
        setInput('');
        fetchMessages(selectedConv.id);
        // تحديث المحادثات تلقائياً بعد إرسال رسالة
        fetchConversations();
      }
    } catch (e) {
      setError('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConv = (conv: any) => {
    setSelectedConv(conv);
    if (conv) fetchMessages(conv.id);
    if (isMobile) setShowSidebar(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row items-center justify-center py-4 md:py-8 px-2 md:px-12" dir="rtl">
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
            {conversations.length === 0 ? (
              <div className="text-center text-gray-400 py-12">لا توجد محادثات بعد</div>
            ) : (
              conversations.map((conv) => {
                const other = (conv.participants || []).find((p: any) => p.id !== conv.user_id) || conv.participants?.[0];
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
                        {conv.last_message?.body ? conv.last_message.body : 'لا توجد رسائل بعد'}
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
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6"><path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          )}
          <CardHeader className="flex flex-row items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl p-4">
            <Avatar>
              <AvatarImage src={selectedConv.participants?.[0]?.profile_photo_url} alt={selectedConv.participants?.[0]?.name} />
              <AvatarFallback>{(selectedConv.participants?.[0]?.name || 'م').slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="font-bold text-gray-800 dark:text-gray-100 text-base">{selectedConv.participants?.[0]?.name || 'مستخدم'}</CardTitle>
              <div className="text-xs text-gray-400">{selectedConv.last_message?.created_date || selectedConv.updated_date || ''}</div>
            </div>
          </CardHeader>
          
          {/* منطقة المحادثة مع Ref خاص */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto custom-scrollbar"
            style={{ minHeight: 400 }}
          >
            <CardContent className="px-2 py-4 md:px-6 md:py-6" style={{ background: 'transparent' }}>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-300 py-12">لا توجد رسائل بعد</div>
              ) : (
                <>
                  {[...messages].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((msg: any) => {
                    const isAuth = msg.user_id === authId;
                    
                    return (
                      <div key={msg.id} className={`flex ${isAuth ? 'justify-end' : 'justify-start'} mb-4 items-center gap-2 transition-all`}>
                        {!isAuth && (
                          msg.user?.profile_photo_url ? (
                            <img
                              src={msg.user.profile_photo_url}
                              alt={msg.user.name}
                              className="w-9 h-9 rounded-xl object-cover border border-blue-100 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-300 select-none">
                                {(msg.user?.name || '').slice(0, 2)}
                              </span>
                            </div>
                          )
                        )}
                        
                        <div
                          className={
                            `max-w-[90vw] md:max-w-[60%] rounded-2xl px-4 py-2 border text-sm break-words ` +
                            (isAuth
                              ? 'bg-blue-100 dark:bg-[#1a2236] text-gray-800 dark:text-white border-blue-200 dark:border-blue-800 rounded-tr-none shadow-md'
                              : 'bg-gray-100 dark:bg-[#23272f] text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'
                            )
                          }
                          style={{ minHeight: 40 }}
                        >
                          <div>{msg.message || msg.body}</div>
                          <div className={`text-xs mt-1 ${isAuth
                            ? 'text-blue-600 dark:text-blue-200 text-left'
                            : 'text-gray-500 dark:text-gray-300 text-right'
                            }`}>
                            {msg.user?.name} <span className="mx-1">·</span> {msg.created_date}
                          </div>
                        </div>
                        
                        {isAuth && (
                          msg.user?.profile_photo_url ? (
                            <img
                              src={msg.user.profile_photo_url}
                              alt={msg.user.name}
                              className="w-9 h-9 rounded-xl object-cover border border-blue-100 dark:border-gray-700"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-blue-100 dark:border-gray-700 bg-blue-50 dark:bg-gray-800">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-300 select-none">
                                {(msg.user?.name || '').slice(0, 2)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </CardContent>
          </div>
          
          <form onSubmit={handleSend}  className="flex gap-2 items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl sticky bottom-0 z-10 shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.04)]">
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
      {/* إذا لم تكن هناك محادثة مفتوحة، اعرض رسالة إرشادية */}
      {!selectedConv && !showSidebar && (
        <div className="flex-1 w-full max-w-3xl mx-auto flex items-center justify-center h-[85vh]">
          <div className="text-xl text-gray-400 dark:text-gray-300 font-bold text-center">اختر أي محادثة للبدء</div>
        </div>
      )}
    </div>
  );
};

export default Messenger;