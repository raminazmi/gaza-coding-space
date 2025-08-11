import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBookmark, FiTrash2, FiUser, FiCalendar, FiSearch, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '@/components/SEO';

interface SavedArticle {
    id: string;
    name: string;
    image: string;
    small_description?: string;
    created_by?: string;
    created_at?: string;
    savedAt: number;
}

const SavedArticles = () => {
    const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredArticles, setFilteredArticles] = useState<SavedArticle[]>([]);

    useEffect(() => {
        // جلب المقالات المحفوظة من localStorage
        const saved = localStorage.getItem('savedArticles');
        if (saved) {
            try {
                const articles = JSON.parse(saved);
                setSavedArticles(articles);
                setFilteredArticles(articles);
            } catch (error) {
                console.error('Error parsing saved articles:', error);
                setSavedArticles([]);
                setFilteredArticles([]);
            }
        }
    }, []);

    useEffect(() => {
        // فلترة المقالات حسب البحث
        if (searchTerm.trim() === '') {
            setFilteredArticles(savedArticles);
        } else {
            const filtered = savedArticles.filter(article =>
                article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (article.small_description && article.small_description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredArticles(filtered);
        }
    }, [searchTerm, savedArticles]);

    const removeFromSaved = (articleId: string) => {
        const updatedArticles = savedArticles.filter(article => article.id !== articleId);
        setSavedArticles(updatedArticles);
        localStorage.setItem('savedArticles', JSON.stringify(updatedArticles));
    };

    const clearAllSaved = () => {
        setSavedArticles([]);
        setFilteredArticles([]);
        localStorage.removeItem('savedArticles');
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-hero py-8" dir="rtl">
            <SEO
                title="المقالات المحفوظة"
                description="إدارة المقالات المحفوظة - يمكنك هنا عرض وإدارة جميع المقالات التي قمت بحفظها للقراءة لاحقاً"
                keywords="مقالات محفوظة, قائمة القراءة, مقالات مفضلة, حفظ المقالات"
                type="website"
                noIndex={true}
            />
            <div className="container max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <FiBookmark className="h-8 w-8 text-primary" />
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                            المقالات المحفوظة
                        </h1>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                            {savedArticles.length}
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                        يمكنك هنا إدارة المقالات التي قمت بحفظها للقراءة لاحقاً
                    </p>
                </div>

                {/* Search and Actions */}
                {savedArticles.length > 0 && (
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input
                                type="text"
                                placeholder="ابحث في المقالات المحفوظة..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <FiX className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Clear All Button */}
                        <button
                            onClick={clearAllSaved}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <FiTrash2 className="h-4 w-4" />
                            <span className="text-sm font-medium">حذف الكل</span>
                        </button>
                    </div>
                )}

                {/* Articles Grid */}
                {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredArticles.map((article, index) => (
                                <motion.div
                                    key={article.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                >
                                    <Link to={`/articles/${article.id}`} className="block">
                                        <div className="relative">
                                            <img
                                                src={article.image}
                                                alt={article.name}
                                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute top-3 left-3">
                                                <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                                    محفوظ
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                {article.name}
                                            </h3>

                                            {article.small_description && (
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                                    {article.small_description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <FiUser className="h-3 w-3" />
                                                    <span>{article.created_by || 'غير معروف'}</span>
                                                </div>
                                                {article.created_at && (
                                                    <div className="flex items-center gap-2">
                                                        <FiCalendar className="h-3 w-3" />
                                                        <span>
                                                            {new Date(article.created_at).toLocaleDateString('ar-EG')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                                                تم الحفظ في: {formatDate(article.savedAt)}
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Remove Button */}
                                    <div className="px-5 pb-5">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                removeFromSaved(article.id);
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <FiTrash2 className="h-4 w-4" />
                                            <span className="text-sm font-medium">إزالة من المحفوظات</span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : savedArticles.length > 0 ? (
                    // No search results
                    <div className="text-center py-12">
                        <FiSearch className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                            لا توجد نتائج
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            لم نجد أي مقالات تطابق بحثك "{searchTerm}"
                        </p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                        >
                            إظهار جميع المقالات
                        </button>
                    </div>
                ) : (
                    // Empty state
                    <div className="text-center py-16">
                        <FiBookmark className="h-24 w-24 text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3">
                            لا توجد مقالات محفوظة
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            لم تقم بحفظ أي مقالات بعد. ابدأ بتصفح المقالات واحفظ المقالات التي تهمك لقراءتها لاحقاً.
                        </p>
                        <Link
                            to="/articles"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            تصفح المقالات
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SavedArticles;
