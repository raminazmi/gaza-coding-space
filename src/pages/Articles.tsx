import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiArrowLeft, FiSearch } from 'react-icons/fi';
import ArticleCardSkeleton from '@/components/ui/ArticleCardSkeleton';
import { apiBaseUrl } from '@/lib/utils';

const Articles = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/article`)
      .then(res => res.json())
      .then(data => setArticles(data.articles || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCategoriesLoading(true);
    fetch(`${apiBaseUrl}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const getCategoryName = (id: number | string) => {
    const cat = categories.find((c: any) => String(c.id) === String(id));
    return cat ? cat.name : id;
  };

  const isLoading = loading || categoriesLoading;

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (article.description && article.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-0 pb-16" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">
            المقالات العلمية
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            أحدث المقالات والدروس البرمجية والتقنية
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mt-8 mb-8">
          <input
            type="text"
            placeholder="ابحث عن مقال..."
            className="w-full py-3 px-5 pr-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            dir="rtl"
          />
          <FiSearch className="absolute right-4 top-3.5 text-gray-400 text-xl" />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={article.image}
                    alt={article.name}
                    className="w-full h-48 object-cover"
                  />
                  {article.category_id && (
                    <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {getCategoryName(article.category_id)}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="h-4 w-4" />
                      <span>{article.created_at ? article.created_at.split('T')[0] : ''}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiUser className="h-4 w-4" />
                      <span>{article.created_by}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{article.description}</p>

                  <div className="flex items-center justify-between">
                    <span></span>
                    <Link
                      to={`/articles/${article.id}`}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-semibold"
                    >
                      اقرأ المزيد
                      <FiArrowLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">لا توجد مقالات متاحة حالياً</h3>
              <p className="text-muted-foreground mb-6">
                سنقوم بإضافة مقالات جديدة قريباً. تابعنا للحصول على أحدث المحتوى!
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                العودة للرئيسية
                <FiArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;