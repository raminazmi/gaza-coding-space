import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUser, FiCalendar, FiTag, FiShare2, FiBookmark, FiClock, FiCheck } from 'react-icons/fi';
import ProjectDetailsSkeleton from '@/components/ui/ProjectDetailsSkeleton';
import FontSizeControl from '@/components/ui/FontSizeControl';
import { apiBaseUrl } from '@/lib/utils';
import { useAppDispatch, useSavedArticles } from '@/hooks';
import { setArticleData } from '@/store/slices/breadcrumbSlice';
import SEO from '@/components/SEO';

const ArticleDetails = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [articleFontSize, setArticleFontSize] = useState(16);

  // دالة لتحديث حجم الخط
  const handleFontSizeChange = (newSize: number) => {
    console.log('Font size changed to:', newSize);
    setArticleFontSize(newSize);
  };

  // استخدام hook المقالات المحفوظة
  const { saveArticle, removeArticle, isArticleSaved } = useSavedArticles();

  // استعادة حجم الخط المحفوظ عند تحميل المكون
  useEffect(() => {
    const savedFontSize = localStorage.getItem('article-font-size');
    if (savedFontSize) {
      const size = parseInt(savedFontSize);
      if (size >= 12 && size <= 24) {
        setArticleFontSize(size);
      }
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // جلب جميع المقالات أولاً (أكثر أماناً)
    const fetchAllArticles = () => {
      return fetch(`${apiBaseUrl}/api/article?per_page=200`)
        .then(res => res.json())
        .then(data => {
          console.log('All articles response:', data);
          const articles = data.articles || data.data || [];
          const found = articles.find((a: any) => String(a.id) === String(id));
          console.log('Found article:', found);

          // إعداد المقالات ذات الصلة (استثناء المقالة الحالية)
          if (found) {
            const related = articles
              .filter((a: any) => String(a.id) !== String(id))
              .slice(0, 4); // أخذ أول 4 مقالات كمقالات ذات صلة
            setRelatedArticles(related);
          }

          return found;
        });
    };

    fetchAllArticles()
      .then(articleData => {
        setArticle(articleData || null);
        if (articleData) {
          dispatch(setArticleData({
            title: articleData.name,
            id: String(articleData.id)
          }));
        }
      })
      .catch(error => {
        console.error('Error loading article:', error);
        setArticle(null);
      })
      .finally(() => setLoading(false));
  }, [id, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showShareMenu && !target.closest('.share-menu-container')) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showShareMenu]);

  if (loading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">المقالة غير موجودة</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">المقالة التي تبحث عنها غير موجودة أو قد تم إزالتها</p>
          <button
            onClick={() => navigate('/articles')}
            className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تصفح المقالات
          </button>
        </div>
      </div>
    );
  }

  // حساب وقت القراءة التقديري
  const calculateReadingTime = (content: string) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTimeMinutes = Math.ceil(words / 200); // متوسط 200 كلمة في الدقيقة
    return readingTimeMinutes;
  };

  // وظيفة الحفظ
  const handleSaveArticle = () => {
    if (!article) return;

    const isSaved = isArticleSaved(article.id);

    if (isSaved) {
      // إزالة من المحفوظات
      const success = removeArticle(article.id);
      if (success) {
        setSaveMessage('تم إزالة المقال من المحفوظات');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } else {
      // إضافة للمحفوظات
      const success = saveArticle(article);
      if (success) {
        setSaveMessage('تم حفظ المقال بنجاح');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    }
  };

  // وظيفة المشاركة
  const handleShare = async (platform?: string) => {
    if (!article) return;

    const url = window.location.href;
    const text = `${article.name} - ${article.small_description || ''}`;

    if (platform) {
      let shareUrl = '';
      switch (platform) {
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
      }
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    } else {
      // استخدام Web Share API إذا كان متاحاً
      if (navigator.share) {
        try {
          await navigator.share({
            title: article.name,
            text: article.small_description || '',
            url: url
          });
        } catch (error) {
          console.log('Error sharing:', error);
        }
      } else {
        // نسخ الرابط للحافظة
        try {
          await navigator.clipboard.writeText(url);
          setSaveMessage('تم نسخ الرابط للحافظة');
          setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
          console.log('Error copying to clipboard:', error);
        }
      }
    }
    setShowShareMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8" dir="rtl">
      {article && (
        <SEO
          title={article.name}
          description={article.small_description || article.description?.replace(/<[^>]*>/g, '').substring(0, 160)}
          keywords={`${article.name}, مقال تقني, برمجة, تطوير الويب, تقنية`}
          type="article"
          image={article.image}
          url={`${typeof window !== 'undefined' ? window.location.origin : ''}/articles/${article.id}`}
          article={{
            publishedTime: article.created_at,
            modifiedTime: article.updated_at || article.created_at,
            author: article.created_by,
            section: 'Technology',
            tags: [article.name, 'تقنية', 'برمجة']
          }}
        />
      )}
      <div className="container max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Link to="/articles" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors text-sm">
            <FiArrowRight className="h-4 w-4" />
            العودة للمقالات
          </Link>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
              {/* Hero Section */}
              <div className="relative">
                <img
                  src={article.image}
                  alt={article.name}
                  className="w-full h-80 object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute bottom-4 right-4 left-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{article.name}</h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <FiUser className="h-4 w-4" />
                      <span className="text-sm">{article.created_by || 'غير معروف'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      <span className="text-sm">
                        {article.created_at ? new Date(article.created_at).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="h-4 w-4" />
                      <span className="text-sm">{calculateReadingTime(article.description)} دقائق قراءة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="p-6">
                {/* Description */}
                {article.small_description && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl border border-primary/20">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">نبذة مختصرة</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {article.small_description}
                    </p>
                  </div>
                )}

                {/* Article Content */}
                <div className="mb-6">
                  {/* Font Size Control */}
                  <div className="flex justify-end mb-4">
                    <FontSizeControl
                      onFontSizeChange={handleFontSizeChange}
                      initialSize={16}
                      minSize={12}
                      maxSize={24}
                      step={2}
                    />
                  </div>

                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <div
                      className="article-content-dynamic text-gray-700 dark:text-gray-200 leading-relaxed transition-all duration-300"
                      dangerouslySetInnerHTML={{ __html: article.description || 'لا يوجد محتوى متاح.' }}
                      style={{
                        wordBreak: 'break-word',
                        lineHeight: '1.8',
                        fontSize: `${articleFontSize}px`,
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>                {/* Article Actions */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="flex items-center gap-4">
                    {/* Share Button */}
                    <div className="relative share-menu-container">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowShareMenu(!showShareMenu);
                        }}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
                      >
                        <FiShare2 className="h-5 w-5" />
                        <span className="text-sm">مشاركة</span>
                      </button>

                      {/* Share Menu */}
                      {showShareMenu && (
                        <div
                          className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-10 min-w-48"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleShare('whatsapp')}
                            className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            مشاركة عبر واتساب
                          </button>
                          <button
                            onClick={() => handleShare('telegram')}
                            className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            مشاركة عبر تيليجرام
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            مشاركة عبر تويتر
                          </button>
                          <button
                            onClick={() => handleShare('facebook')}
                            className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            مشاركة عبر فيسبوك
                          </button>
                          <hr className="my-2 border-gray-200 dark:border-gray-600" />
                          <button
                            onClick={() => handleShare()}
                            className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          >
                            نسخ الرابط
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveArticle}
                      className={`flex items-center gap-2 transition-colors ${isArticleSaved(article.id)
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                        }`}
                    >
                      {isArticleSaved(article.id) ? (
                        <FiCheck className="h-5 w-5" />
                      ) : (
                        <FiBookmark className="h-5 w-5" />
                      )}
                      <span className="text-sm">
                        {isArticleSaved(article.id) ? 'محفوظ' : 'حفظ'}
                      </span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <FiTag className="h-4 w-4" />
                    <span>مقال تقني</span>
                  </div>
                </div>

                {/* Save Message */}
                {saveMessage && (
                  <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                    <p className="text-green-800 dark:text-green-300 text-sm text-center">
                      {saveMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sticky top-20 max-h-[calc(100vh-6rem)]">
                <div className="flex items-center gap-3 mb-6">
                  <FiTag className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    مقالات ذات صلة
                  </h2>
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    {relatedArticles.length}
                  </span>
                </div>

                <div className={`space-y-4 ${relatedArticles.length > 2 ? 'overflow-y-auto max-h-[calc(100vh-12rem)] pr-2 custom-scrollbar' : ''}`}>
                  {relatedArticles.map((relatedArticle: any) => (
                    <Link
                      key={relatedArticle.id}
                      to={`/articles/${relatedArticle.id}`}
                      className="block bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-3 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={relatedArticle.image}
                          alt={relatedArticle.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-md"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1 line-clamp-2">
                            {relatedArticle.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <FiUser className="h-3 w-3" />
                            <span>{relatedArticle.created_by || 'غير معروف'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <FiCalendar className="h-3 w-3" />
                            <span>
                              {relatedArticle.created_at ? new Date(relatedArticle.created_at).toLocaleDateString('ar-EG') : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticleDetails; 