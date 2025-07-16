import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiClock, FiArrowLeft, FiTag } from 'react-icons/fi';
import { articles } from '@/data/articles';
import { apiBaseUrl } from '@/lib/utils';

const Articles = () => {
  return (
    <div className="min-h-screen py-16 bg-gradient-hero" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">
            المقالات العلمية
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            أحدث المقالات والدروس البرمجية والتقنية
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article 
                key={article.id} 
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
              <div className="relative">
                <img
                  src={article.thumbnail}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {article.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="h-4 w-4" />
                      <span>{article.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiUser className="h-4 w-4" />
                      <span>{article.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="h-4 w-4" />
                      <span>{article.readTime} دقيقة</span>
                  </div>
                </div>
                  
                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{article.description}</p>

                <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      {article.tags.slice(0, 2).map((tag, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-xs"
                        >
                          <FiTag className="h-3 w-3" />
                        {tag}
                        </span>
                    ))}
                  </div>

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