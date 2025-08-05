import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiArrowLeft, FiTag, FiCalendar, FiEye } from 'react-icons/fi';
import ProjectCardSkeleton from '@/components/ui/ProjectCardSkeleton';
import { apiBaseUrl } from '@/lib/utils';

const Portfolio = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/project`)
      .then(res => res.json())
      .then(data => setProjects(data.projects || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pt-0 pb-16" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">
            أعمالنا
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            بعض من مشاريعنا وأعمالنا البرمجية المميزة
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                {/* Project Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={project.images && project.images.length > 0 
                      ? (project.images[0].image.startsWith('http') ? project.images[0].image : `${apiBaseUrl}/storage/${project.images[0].image}`)
                      : project.image
                    }
                    alt={project.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Images Count Badge */}
                  {project.images && project.images.length > 0 && (
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-lg border border-white/20 dark:border-gray-700/30">
                        <div className="flex items-center justify-center w-5 h-5 bg-gradient-primary rounded-full shadow-sm">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{project.images.length}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                          title="مشاهدة المشروع"
                        >
                          <FiExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <Link
                        to={`/portfolio/${project.id}`}
                        className="bg-primary text-white p-2 rounded-full hover:bg-primary-hover transition-colors shadow-lg"
                        title="عرض التفاصيل"
                      >
                        <FiEye className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 left-2">
                    <h3 className="text-lg font-bold text-white mb-1">{project.name}</h3>
                    <div className="flex items-center gap-2 text-white/90">
                      <FiCalendar className="h-3 w-3" />
                      <span className="text-xs">{project.completedAt || project.created_at || ''}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Project Description */}
                  <div className="mb-4">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm line-clamp-2">
                      {project.description || 'لا يوجد وصف متاح لهذا المشروع'}
                    </p>
                  </div>

                  {/* Skills Section */}
                  {project.skill && project.skill.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FiTag className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">المهارات المستخدمة</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.skill.slice(0, 3).map((tech: any) => (
                          <div
                            key={tech.id}
                            className="flex items-center gap-1 bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {tech.image && (
                              <img 
                                src={tech.image.startsWith('http') ? tech.image : `${apiBaseUrl}/storage/${tech.image}`} 
                                alt={tech.name} 
                                className="w-4 h-4 rounded-full object-cover" 
                              />
                            )}
                            <span className="text-xs">{tech.name}</span>
                          </div>
                        ))}
                        {project.skill.length > 3 && (
                          <div className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                            +{project.skill.length - 3} أكثر
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Services Section */}
                  {project.services && project.services.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">الخدمات المقدمة</h4>
                        <span className="bg-gradient-primary text-white px-2 py-1 rounded-full text-xs font-bold">
                          {project.services.length}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {project.services.slice(0, 2).map((service: any) => (
                          <div
                            key={service.id}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-lg border border-primary/20 dark:border-primary/30 hover:shadow-md transition-all duration-300"
                          >
                            {service.image && (
                              <div className="flex-shrink-0">
                                <img 
                                  src={service.image.startsWith('http') ? service.image : `${apiBaseUrl}/storage/${service.image}`} 
                                  alt={service.name} 
                                  className="w-8 h-8 rounded-lg object-cover shadow-sm" 
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h5 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-1 line-clamp-1">
                                {service.name}
                              </h5>
                              {service.small_description && (
                                <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">
                                  {service.small_description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {project.services.length > 2 && (
                          <div className="text-center">
                            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 text-primary dark:text-primary-foreground px-4 py-2 rounded-lg border border-primary/20 dark:border-primary/30">
                              <span className="text-sm font-bold">+{project.services.length - 2}</span>
                              <span className="text-xs">خدمات إضافية</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}



                  {/* Action Button */}
                  <div className="flex justify-end">
                    <Link
                      to={`/portfolio/${project.id}`}
                      className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm"
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