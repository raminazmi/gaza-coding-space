import React, { useEffect, useRef, useState } from 'react';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Loading from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

  // Fetch conversations
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

  // Fetch messages for selected conversation
  const fetchMessages = async (convId: number) => {
    setLoadingMsgs(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/messages?conversation_id=${convId}`, {
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
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (data && data.id) {
          setMessages([data]);
        } else {
          setMessages([]);
        }
      } catch {
        setError('استجابة غير متوقعة من الخادم.');
        setMessages([]);
      }
    } catch {
      setError('حدث خطأ أثناء تحميل الرسائل.');
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  };

  // Polling for new messages
  useEffect(() => {
    if (!selectedConv) return;
    fetchMessages(selectedConv.id);
    const interval = setInterval(() => fetchMessages(selectedConv.id), 5000);
    return () => clearInterval(interval);
  }, [selectedConv]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedConv) return;
    setSending(true);
    setError('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('conversation_id', selectedConv.id);
    formData.append('body', input);
    formData.append('type', 'text');
    try {
      const res = await fetch(`${apiBaseUrl}/api/messages`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.ok) {
        setInput('');
        fetchMessages(selectedConv.id);
      } else {
        setError('حدث خطأ أثناء إرسال الرسالة');
      }
    } catch {
      setError('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  // Responsive layout
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row items-center justify-center py-8" dir="rtl">
      {/* Conversations List */}
      <Card className="md:w-1/3 w-full md:max-w-xs mx-auto md:mx-0 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex-shrink-0 flex flex-col h-[80vh] md:h-[80vh] mb-6 md:mb-0">
        <CardHeader className="flex flex-row items-center gap-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-2xl p-4">
          <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-100">الدردشة والاستفسارات</CardTitle>
          <span className="ml-auto w-3 h-3 rounded-full bg-green-400 inline-block"></span>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto custom-scrollbar p-0">
          {loadingConvs ? (
            <Loading text="جاري تحميل الدردشات..." />
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-400 py-12">لا توجد محادثات بعد</div>
          ) : (
            conversations.map((conv) => {
              const other = (conv.participants || []).find((p: any) => p.id !== conv.user_id) || conv.participants?.[0];
              return (
                <div
                  key={conv.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-primary/10 transition-all ${selectedConv?.id === conv.id ? 'bg-primary/20' : ''}`}
                  onClick={() => setSelectedConv(conv)}
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
      {/* Chat Room */}
      <Card className="flex-1 w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-[80vh]">
        {selectedConv ? (
          <>
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
            <CardContent className="flex-1 overflow-y-auto px-2 py-4 md:px-6 md:py-6 custom-scrollbar" style={{ background: 'transparent', minHeight: 400 }}>
              {loadingMsgs ? (
                <Loading text="جاري تحميل الرسائل..." />
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-300 py-12">لا توجد رسائل بعد</div>
              ) : (
                messages.map((msg: any) => {
                  const isMe = msg.user_id === Number(localStorage.getItem('user_id'));
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2 mb-2`}>
                      {!isMe && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.user?.profile_photo_url} alt={msg.user?.name} />
                          <AvatarFallback>{(msg.user?.name || 'م').slice(0, 1)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 text-base shadow-elegant border ${isMe ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-700 rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 rounded-tl-none'}`}>
                        <div>{msg.body}</div>
                        <div className="text-xs text-gray-400 mt-1 text-left">{msg.created_date}</div>
                      </div>
                      {isMe && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.user?.profile_photo_url} alt={msg.user?.name} />
                          <AvatarFallback>{(msg.user?.name || 'م').slice(0, 1)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <form onSubmit={handleSend} className="flex gap-2 items-center p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
              <Input
                type="text"
                className="flex-1 rounded-xl shadow-elegant h-12 text-base md:text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="اكتب رسالتك..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={sending}
                dir="rtl"
              />
              <Button type="submit" size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 px-6 text-lg transition-all duration-200 disabled:opacity-60 dark:bg-blue-700 dark:hover:bg-blue-800 dark:text-white" disabled={sending || !input.trim()}>
                {sending ? 'جاري الإرسال...' : 'إرسال'}
              </Button>
            </form>
            {error && <div className="text-center text-red-600 mt-2">{error}</div>}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-400 text-xl">اختر محادثة لعرض الرسائل</div>
        )}
      </Card>
    </div>
  );
};

export default Messenger; 