import { useState, useEffect } from 'react';
import { apiBaseUrl } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Loading from '@/components/ui/Loading';

const PAGE_SIZE = 10;

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1) => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${apiBaseUrl}/api/notifications?page=${pageNum}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok && data.notifications) {
        if (pageNum === 1) {
          setNotifications(data.notifications.data);
        } else {
          setNotifications((prev) => [...prev, ...data.notifications.data]);
        }
        setHasMore(!!data.notifications.next_page_url);
      } else {
        setError('تعذر جلب الإشعارات');
      }
    } catch {
      setError('تعذر جلب الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Mark all notifications as read on page load
    const token = localStorage.getItem('token');
    fetch(`${apiBaseUrl}/api/notifications/read_at`, {
      method: 'PUT',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    fetchNotifications(1);
  }, []);

  const handleLoadMore = () => {
    fetchNotifications(page + 1);
    setPage((p) => p + 1);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center py-4 md:py-8 px-2 md:px-12" dir="rtl">
      <Card className="w-full max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 md:p-10 flex flex-col gap-6">
        <CardHeader className="flex flex-col items-center gap-2 mb-2 p-0">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">الإشعارات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && <Loading />}
          {error && <div className="bg-red-100 text-red-800 rounded p-3 mb-4 text-center">{error}</div>}
          {!loading && notifications.length === 0 && <div className="text-center text-gray-500">لا توجد إشعارات</div>}
          <ul className="flex flex-col gap-4">
            {notifications.map((n) => (
              <li key={n.id} className={`rounded-lg p-4 shadow border ${n.read_at ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-blue-50/60 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700'}`}>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-base text-gray-800 dark:text-gray-100">{n.type?.split('\\').pop() || 'إشعار جديد'}</span>
                  <div className="flex justify-between items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-300">{new Date(n.created_at).toLocaleString('ar-EG')}</span>
                    <span className="text-end">
                      {!n.read_at && <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-500 text-white text-xs w-fit">غير مقروء</span>}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {hasMore && !loading && (
            <Button onClick={handleLoadMore} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 text-lg transition-all duration-200">تحميل المزيد</Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;