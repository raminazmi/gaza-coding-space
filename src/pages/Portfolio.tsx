import React from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiGithub, FiArrowLeft, FiTag, FiCalendar } from 'react-icons/fi';
import { portfolio } from '@/data/portfolio';
import { apiBaseUrl } from '@/lib/utils';

const Portfolio = () => {
  return (
    <div className="min-h-screen py-16 bg-gradient-hero" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">
            أعمالنا
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            بعض من مشاريعنا وأعمالنا البرمجية المميزة
          </p>
        </div>

        {portfolio.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.map((project) => (
              <div 
                key={project.id} 
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={project.images[0]} 
                    alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                      {project.liveUrl && (
                        <a 
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="مشاهدة المشروع"
                        >
                          <FiExternalLink className="h-5 w-5" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a 
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="مشاهدة المشروع"
                        >
                          <FiGithub className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{project.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FiCalendar className="h-4 w-4" />
                      <span>{project.completedAt}</span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        <FiTag className="h-3 w-3" />
                        {tech}
                      </span>
                    ))}
                </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {project.category}
                      </span>
                    
                    <Link 
                      to={`/portfolio/${project.id}`}
                      className="inline-flex items-center gap-2 text-primary hover:text-primary-hover transition-colors font-semibold"
                    >
                      عرض التفاصيل
                      <FiArrowLeft className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg max-w-md mx-auto">
            <div className="text-6xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-2">لا توجد أعمال متاحة حالياً</h3>
              <p className="text-muted-foreground mb-6">
                سنقوم بإضافة مشاريعنا الجديدة قريباً. تابعنا لمعرفة أحدث أعمالنا!
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

export default Portfolio;