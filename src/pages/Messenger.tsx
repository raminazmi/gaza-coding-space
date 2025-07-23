import React, { useEffect, useRef, useState } from 'react';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/Loading';
import { Input } from '@/components/ui/input';
import { FiSend, FiPaperclip } from 'react-icons/fi';
import { usePusher } from '@/context/PusherContext';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ar-EG', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

function formatRelativeTime(dateString) {
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
  body?: string;
  message?: string;
  created_at: string;
  created_date?: string;
  user?: Participant;
  is_temp?: boolean;
  file_name?: string;
  file_url?: string;
};

type Conversation = {
  id: number;
  participants: Participant[];
  last_message?: Message;
  updated_date?: string;
  new_messages?: number;
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
  const [alertAudio] = useState<HTMLAudioElement>(new Audio('assets/mixkit-correct-answer-tone-2870.wav'));
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = window.innerWidth < 768;
  const [authUser, setAuthUser] = useState<Participant | null>(null);
  const { echo } = usePusher();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibleConvs, setVisibleConvs] = useState(10);
  const [currentMsgPage, setCurrentMsgPage] = useState(1);
  const [hasMoreMsgs, setHasMoreMsgs] = useState(true);
  const [loadingMoreMsgs, setLoadingMoreMsgs] = useState(false);

  useEffect(() => {
    console.log('[Messenger] mount, echo instance:', echo);
    const alertAudio = new Audio('/assets/mixkit-correct-answer-tone-2870.wav');

    const onAudioEnded = () => {
      alertAudio.currentTime = 0;
    };
    alertAudio.addEventListener('ended', onAudioEnded);

    return () => {
      alertAudio.removeEventListener('ended', onAudioEnded);
    };
  }, []);

  const fetchAuthUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/student`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      console.log('[fetchAuthUser] user:', data);
      setAuthUser(data);
    } catch (e) {
      console.error('[fetchAuthUser] error:', e);
    }
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
      const newConvs = Array.isArray(data.data) ? data.data : data;
      setConversations((prev) => page === 1 ? newConvs : [...prev, ...newConvs]);
      setHasMore(data.next_page_url !== null && data.next_page_url !== undefined);
    } catch (e) {
      console.error('[fetchConversations] error:', e);
    } finally {
      setLoadingConvs(false);
      setLoadingMore(false);
    }
  };

  const fetchMessages = async (convId, page = 1) => {
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
        const formattedMessages = data.messages.data.map((msg) => ({
          ...msg,
          created_date: formatDate(msg.created_at),
        })).reverse();
        setMessages((prev) => page === 1 ? formattedMessages : [...formattedMessages, ...prev]);
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

  const markAsRead = async (convId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${apiBaseUrl}/api/conversations/${convId}/read`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setConversations((prev) =>
        prev.map((conv) => (conv.id === convId ? { ...conv, new_messages: 0 } : conv))
      );
    } catch (err) {
      console.error('[markAsRead] error:', err);
    }
  };

  useEffect(() => {
    if (!authUser || !echo) return;
    const channelName = `Messenger.${authUser.id}`;
    const channel = echo.join(channelName);
    console.log(`[Pusher] Subscribing to channel: ${channelName}`);

    const existingListeners = channel.listeners || {};
    if (!existingListeners['.new-message']) {
      channel.listen('.new-message', (data) => {
        console.log('[Pusher] Received new-message event:', data);
        const newMessage = {
          ...data.message,
          created_date: formatDate(data.message.created_at),
          user: data.user,
        };
        if (data.message.user_id === authUser.id) {
          console.log('[Pusher] Ignoring own message via Pusher');
          return;
        }

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === newMessage.id)) return prev;
          return [...prev, newMessage];
        });
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === data.message.conversation_id) {
              return {
                ...c,
                last_message: {
                  ...c.last_message,
                  body: data.message.body,
                  created_date: formatDate(data.message.created_at),
                  id: c.last_message?.id ?? '',
                },
                new_messages: (c.new_messages || 0) + (selectedConv && selectedConv.id === data.message.conversation_id ? 0 : 1),
              } as Conversation;
            }
            return c;
          })
        );
        if (authUser && data.message.user_id !== authUser.id) {
          const alertAudio = new Audio('/assets/mixkit-correct-answer-tone-2870.wav');
          alertAudio.play();
        }
      });
    }

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
    }
  }, [selectedConv]);

  useEffect(() => {
    if (messages.length > 0 && chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !selectedFile) || !selectedConv || !authUser) return;

    const messageText = input;
    const tempMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConv.id,
      user_id: authUser.id,
      body: messageText,
      created_at: new Date().toISOString(),
      created_date: formatDate(new Date().toISOString()),
      user: authUser,
      is_temp: true,
      file_name: selectedFile?.name || undefined,
    };

    setMessages((prev) => [...prev, tempMessage]);

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConv.id) {
          return {
            ...c,
            last_message: {
              ...c.last_message,
              body: messageText,
              created_date: formatDate(new Date().toISOString()),
              id: tempMessage.id,
            },
          } as Conversation;
        }
        return c;
      })
    );

    setInput('');
    setSending(true);
    setError('');

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('conversation_id', selectedConv.id.toString());
    formData.append('message', messageText);
    if (selectedFile) formData.append('file', selectedFile);

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
        const realMessage = {
          ...responseData.message,
          created_date: formatDate(responseData.message.created_at),
          user: authUser,
          is_temp: false,
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
        prev.map((c) => {
          if (c.id === selectedConv.id) {
            return {
              ...c,
              last_message: c.last_message,
            } as Conversation;
          }
          return c;
        })
      );
    } finally {
      setSending(false);
      setSelectedFile(null);
    }
  };

  const handleSelectConv = (conv) => {
    setSelectedConv(conv);
    if (isMobile) setShowSidebar(false);
  };

  const getOtherParticipant = (conv) => {
    return (conv.participants || []).find((p) => p.id !== authUser?.id) || conv.participants?.[0];
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center py-4 md:py-8 px-2 md:px-12" dir="rtl">
      {(!selectedConv || showSidebar) && (
        <Card
          className="w-full md:w-1/4 max-w-full md:max-w-1/4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col h-[90vh] mb-4 md:mb-0"
          style={{ zIndex: 20 }}
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
                    className={`flex items-center gap-3 px-4 py-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-primary/10 transition-all rounded-xl mx-2 my-1 ${selectedConv?.id === conv.id ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400' : ''
                      }`}
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
                      <div className="font-bold text-gray-800 dark:text-gray-100 text-base truncate">{other?.name || 'مستخدم'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-300 truncate">
                        {conv.last_message?.file_name ? (
                          <span className="flex items-center gap-1">
                            <FiPaperclip /> {conv.last_message.file_name}
                          </span>
                        ) : conv.last_message?.body || 'لا توجد رسائل بعد'}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 min-w-[70px]">
                      <span className="text-xs text-gray-400">{conv.last_message?.created_date || conv.updated_date || ''}</span>
                      {(conv.new_messages ?? 0) > 0 && (
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
        <Card className="flex-1 w-full max-w-3/4 mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[90vh] relative transition-all duration-300 mb-4 md:mb-0">
          {isMobile && (
            <button
              className="absolute top-4 left-4 z-30 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full w-10 h-10 flex items-center justify-center shadow-md border border-blue-200 dark:border-blue-700"
              onClick={() => setShowSidebar(true)}
              title="العودة لقائمة المحادثات"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <CardHeader className="flex flex-row items-center gap-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl py-1.5 px-4">
            <div className="relative">
              <Avatar>
                <AvatarImage src={getOtherParticipant(selectedConv)?.profile_photo_url} alt={getOtherParticipant(selectedConv)?.name} />
              </Avatar>
              {getOtherParticipant(selectedConv)?.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>}
            </div>
            <div className="flex-1">
              <CardTitle className="font-bold text-gray-800 dark:text-gray-100 text-base">{getOtherParticipant(selectedConv)?.name || 'مستخدم'}</CardTitle>
              <div className="text-xs text-gray-400">{selectedConv.last_message?.created_date || selectedConv.updated_date || ''}</div>
            </div>
            {/* <div className="flex justify-center mb-4">
                  <button
                    className="py-1 px-4 bg-gray-200 dark:bg-gray-700 rounded-full text-blue-600 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => fetchMessages(selectedConv.id, currentMsgPage + 1)}
                  >
                    عرض المزيد
                  </button>
                </div> */}
          </CardHeader>
          <div ref={chatContainerRef} className="flex-1 h-0 overflow-y-auto custom-scrollbar bg-gray-200">
            <CardContent className="px-2 py-4 md:px-6 md:py-6">
              {/* زر عرض المزيد أعلى الرسائل */}
              {/* {hasMoreMsgs && !loadingMoreMsgs && !loadingMsgs && messages.length > 0 && (
                <div className="flex justify-center mb-4">
                  <button
                    className="py-1 px-4 bg-gray-200 dark:bg-gray-700 rounded-full text-blue-600 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    onClick={() => fetchMessages(selectedConv.id, currentMsgPage + 1)}
                  >
                    عرض المزيد
                  </button>
                </div>
              )} */}
              {loadingMoreMsgs && <div className="text-center py-2">جاري تحميل المزيد...</div>}
              {/* الرسائل */}
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
                    return (
                      <div key={msg.id} className={`flex ${isAuth ? 'justify-start' : 'justify-end'} mb-4 items-center gap-2 transition-all`}>
                        {/* {isAuth ?
                        <Avatar className="flex-shrink-0">
                          {msg.user?.profile_photo_url ? (
                            <AvatarImage src={msg.user.profile_photo_url} alt={msg.user.name} />
                          ) : (
                            <AvatarFallback>{msg.user?.name?.[0]}</AvatarFallback>
                          )}
                        </Avatar>
                          :<></>} */}
                        <div
                          className={`max-w-[90vw] md:max-w-[60%] rounded-2xl px-4 py-2 text-sm break-words ${isAuth ? 'bg-blue-500 text-white dark:bg-blue-600 rounded-br-none shadow-md' : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-sm'
                            }`}
                          style={{ minHeight: 40 }}
                        >
                          <div>{msg.message || msg.body}</div>
                          {msg.file_url && (
                            <div className="mt-2">
                              <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                                <FiPaperclip />
                                {msg.file_name || 'ملف مرفق'}
                              </a>
                              {msg.file_url.match(/\.(jpg|jpeg|png|gif)$/i) && <img src={msg.file_url} alt={msg.file_name} className="max-w-xs mt-2 rounded" />}
                            </div>
                          )}
                          <div className={`text-xs mt-1 ${isAuth ? 'text-blue-100 dark:text-blue-200 text-left' : 'text-gray-500 dark:text-gray-300 text-right'}`}>
                            {formatRelativeTime(msg.created_at)}
                          </div>
                        </div>
                        {/* {!isAuth ?
                        <Avatar className="flex-shrink-0">
                          {msg.user?.profile_photo_url ? (
                            <AvatarImage src={msg.user.profile_photo_url} alt={msg.user.name} />
                          ) : (
                            <AvatarFallback>{msg.user?.name?.[0]}</AvatarFallback>
                          )}
                        </Avatar>
                          :<></>} */}
                      </div>
                    );
                  })
              )}
              <div ref={messagesEndRef} />
            </CardContent>
          </div>
          <form onSubmit={handleSend} className="flex gap-2 items-center p-2 px-2 md:px-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl sticky bottom-0 z-10 shadow-[0_-2px_8px_-2px_rgba(0,0,0,0.04)]">
            <input type="file" id="chat-file-input" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} title="إرفاق ملف" aria-label="إرفاق ملف" />
            <label htmlFor="chat-file-input" className="cursor-pointer flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 mr-2">
              <FiPaperclip className="text-lg text-gray-600 dark:text-gray-300" />
            </label>
            {selectedFile && <span className="text-xs text-blue-600 dark:text-blue-300 max-w-[100px] truncate">{selectedFile.name}</span>}
            <Input
              type="text"
              className="flex-1 border border-blue-200 dark:border-blue-900 rounded-xl px-4 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              placeholder="اكتب رسالتك..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              dir="rtl"
              style={{ minHeight: 40 }}
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl w-10 h-10 flex items-center justify-center shadow-lg transition-all disabled:opacity-70 text-2xl"
              style={{ minWidth: 40, minHeight: 40 }}
            >
              {sending ? <span className="loader w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <FiSend className="text-xl" />}
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