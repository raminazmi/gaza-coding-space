import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiGithub, FiArrowLeft, FiTag, FiCalendar } from 'react-icons/fi';
import ProjectCardSkeleton from '@/components/ui/ProjectCardSkeleton';
import { apiBaseUrl } from '@/lib/utils';

const Portfolio = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/project`)
      .then(res => res.json())
      .then(data => setProjects(data.projects || []))
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

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                      {project.project_url && (
                        <a
                          href={project.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          title="مشاهدة المشروع"
                        >
                          <FiExternalLink className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold">{project.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <FiCalendar className="h-4 w-4" />
                      <span>{project.completedAt || project.created_at || ''}</span>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-4 line-clamp-3">{project.description}</p>

                  {/* Skills */}
                  {project.skill && project.skill.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skill.map((tech: any) => (
                        <span
                          key={tech.id}
                          className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          <FiTag className="h-3 w-3" />
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Services */}
                  {project.services && project.services.length > 0 && (
                    <div className="mb-4">
                      <div className="font-bold mb-2 text-sm text-gray-700 dark:text-gray-200">الخدمات المرتبطة:</div>
                      <ul className="space-y-2">
                        {project.services.map((service: any) => (
                          <li key={service.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs">
                            <div className="font-semibold mb-1">{service.name}</div>
                            <div className="text-muted-foreground mb-1">{service.small_description}</div>
                            <div className="text-gray-600 dark:text-gray-300 mb-1">{service.description}</div>
                            {service.category_id && (
                              <div className="text-xs text-blue-700 dark:text-blue-300 mb-1">{getCategoryName(service.category_id)}</div>
                            )}
                            {service.image && (
                              <img src={service.image.startsWith('http') ? service.image : `${apiBaseUrl}/storage/${service.image}`} alt={service.name} className="w-12 h-12 rounded mt-2" />
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {/* التصنيف أو الفئة يمكن إضافتها هنا إذا توفرت */}
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