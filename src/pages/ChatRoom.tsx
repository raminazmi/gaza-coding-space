import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiBaseUrl } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';

const ChatRoom = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/messages?conversation_id=${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        setError('تعذر تحميل الرسائل.');
        setMessages([]);
        setLoading(false);
        return;
      }
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        // API returns a single message if only one, or array if multiple
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Polling for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Send message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    setError('');
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('conversation_id', id!);
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
        fetchMessages();
      } else {
        setError('حدث خطأ أثناء إرسال الرسالة');
      }
    } catch {
      setError('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loading text="جاري تحميل الرسائل..." />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col" dir="rtl">
      <div className="container max-w-2xl mx-auto flex-1 flex flex-col px-2 py-6">
        <div className="flex-1 overflow-y-auto mb-4 bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex flex-col gap-3" style={{ minHeight: 400 }}>
          {messages.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-300 py-12">لا توجد رسائل بعد</div>
          )}
          {messages.map((msg: any) => {
            const isMe = msg.user_id === Number(localStorage.getItem('user_id'));
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {!isMe && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.user?.profile_photo_url} alt={msg.user?.name} />
                    <AvatarFallback>{(msg.user?.name || 'م').slice(0, 1)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-xs md:max-w-md rounded-2xl px-4 py-2 text-base shadow border ${isMe ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 border-blue-200 dark:border-blue-700 rounded-tr-none' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 rounded-tl-none'}`}>
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
          })}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 items-center mt-auto">
          <input
            type="text"
            className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm transition-all text-gray-900 dark:text-gray-100"
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
      </div>
    </div>
  );
};

export default ChatRoom; 