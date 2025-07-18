import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiBaseUrl } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { FiUser, FiCalendar } from 'react-icons/fi';
import Loading from '@/components/ui/Loading';
const ArticleDetails = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${apiBaseUrl}/api/article`)
      .then(res => res.json())
      .then(data => {
        const found = (data.articles || data.article || []).find((a: any) => String(a.id) === String(id));
        if (found) {
          setArticle(found);
          if (found.name) {
            localStorage.setItem('breadcrumb_article_title', found.name);
          }
        } else {
          setError('لم يتم العثور على المقالة');
        }
      })
      .catch(() => setError('حدث خطأ أثناء جلب المقالة'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Loading />;
  }
  if (error) {
    return <div className="flex items-center justify-center min-h-[60vh] text-lg text-red-600 dark:text-red-400">{error}</div>;
  }
  if (!article) {
    return <div className="flex items-center justify-center min-h-[60vh] text-lg text-gray-500 dark:text-gray-300">لا توجد بيانات للمقالة</div>;
  }

  return (
    <div className="min-h-screen pt-4 pb-16" dir="rtl">
      <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-0 w-full max-w-4xl mx-auto border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* صورة المقالة */}
        {article.image && (
          <div className="w-full h-56 md:h-72 overflow-hidden flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <img
              src={article.image}
              alt={article.name}
              className="w-full h-full object-cover object-center transition-all duration-300 hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6 md:p-8 flex flex-col gap-4">
          {/* عنوان المقالة */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2 leading-relaxed">{article.name}</h1>
          {/* بيانات الكاتب والتاريخ */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-1">
              <FiUser className="text-blue-500" />
              {article.created_by || 'غير معروف'}
            </span>
            <span className="flex items-center gap-1">
              <FiCalendar className="text-blue-500" />
              {article.created_at ? new Date(article.created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </span>
          </div>
          {/* وصف مختصر */}
          {article.small_description && (
            <div className="text-base text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
              {article.small_description}
            </div>
          )}
          {/* نص المقالة */}
          <div className="prose dark:prose-invert max-w-none text-lg text-gray-700 dark:text-gray-200 leading-relaxed" style={{ wordBreak: 'break-word' }}>
            {article.description || 'لا يوجد محتوى متاح.'}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ArticleDetails; 