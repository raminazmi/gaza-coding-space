import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiArrowLeft, FiSearch } from 'react-icons/fi';
import ArticleCardSkeleton from '@/components/ui/ArticleCardSkeleton';
import Pagination from '@/components/ui/pagination'; // استيراد مكون الترقيم
import { motion } from 'framer-motion'; // استيراد framer-motion
import { apiBaseUrl } from '@/lib/utils';
import SEO from '@/components/SEO';

const Articles = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCategoriesLoading(true);
    fetch(`${apiBaseUrl}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const fetchArticles = async (page: number) => {
    setLoading(true);
    const url = `${apiBaseUrl}/api/article?page=${page}&per_page=8${searchQuery ? `&search=${searchQuery}` : ''}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log('API Response:', data);

      if (Array.isArray(data.articles)) {
        setArticles(data.articles);
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setCurrentPage(data.meta.current_page || page);
        }
      }
    } catch (error) {
      console.error('Error loading articles:', error);
      setArticles([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1); // إعادة تعيين الصفحة إلى 1 عند تغيير البحث
    fetchArticles(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

  const getCategoryName = (id: number | string) => {
    const cat = categories.find((c: any) => String(c.id) === String(id));
    return cat ? cat.name : id;
  };

  const isLoading = loading || categoriesLoading;

  const filteredArticles = articles; // البحث يتم الآن في الـ Backend

  // تعريف كائنات التحريك
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen pt-0 pb-16" dir="rtl">
      <SEO
        title="المقالات العلمية والتقنية"
        description="اكتشف أحدث المقالات والدروس البرمجية والتقنية. تعلم من خبراء في البرمجة، تطوير الويب، الذكاء الاصطناعي والتقنيات الحديثة."
        keywords="مقالات البرمجة, دروس تقنية, مقالات علمية, برمجة, تطوير الويب, ذكاء اصطناعي, تقنيات حديثة"
        type="website"
      />
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
            onChange={(e) => setSearchQuery(e.target.value)}
            dir="rtl"
          />
          <FiSearch className="absolute right-4 top-3.5 text-gray-400 text-xl" />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => <ArticleCardSkeleton key={i} />)}
          </div>
        ) : filteredArticles.length > 0 ? (
          <div>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredArticles.map((article) => (
                <Link key={article.id} to={`/articles/${article.id}`} className="block">
                  <motion.article
                    variants={item}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="relative overflow-hidden">
                        <img
                          src={article.image}
                          alt={article.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {article.category_id && (
                          <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold border border-white/20">
                            {getCategoryName(article.category_id)}
                          </div>
                        )}
                        {/* Reading time estimate */}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs">
                          {Math.ceil((article.description?.replace(/<[^>]*>/g, '')?.split(/\s+/)?.length || 0) / 200)} دقائق قراءة
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="h-4 w-4 text-primary" />
                            <span>{article.created_at ? new Date(article.created_at).toLocaleDateString('ar-EG') : ''}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiUser className="h-4 w-4 text-primary" />
                            <span>{article.created_by || 'غير معروف'}</span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {article.name}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm leading-relaxed">
                          {article.small_description || article.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' || 'لا يوجد وصف متاح'}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className="inline-flex items-center gap-2 bg-gradient-primary text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm w-full justify-center group-hover:scale-105">
                        اقرأ المزيد
                        <FiArrowLeft className="h-4 w-4" />
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </motion.div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
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