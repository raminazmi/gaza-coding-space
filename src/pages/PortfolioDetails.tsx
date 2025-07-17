import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiExternalLink, FiArrowRight, FiTag, FiCalendar } from 'react-icons/fi';
import ProjectCardSkeleton from '@/components/ui/ProjectCardSkeleton';
import { apiBaseUrl } from '@/lib/utils';

const PortfolioDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/project`)
      .then(res => res.json())
      .then(data => {
        const found = (data.projects || []).find((p: any) => String(p.id) === String(id));
        setProject(found || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero" dir="rtl">
        <ProjectCardSkeleton />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">💼</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">المشروع غير موجود</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">المشروع الذي تبحث عنه غير موجود أو قد تم إزالته</p>
          <button
            onClick={() => navigate('/portfolio')}
            className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تصفح الأعمال
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-12" dir="rtl">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-8 flex items-center gap-2">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold">
            <FiArrowRight className="h-5 w-5" />
            العودة للأعمال
          </Link>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
          <div className="relative">
            <img
              src={project.image}
              alt={project.name}
              className="w-full h-64 object-cover"
            />
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-4 left-4 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors shadow"
                title="مشاهدة المشروع"
              >
                <FiExternalLink className="h-5 w-5" />
              </a>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <FiCalendar className="h-4 w-4" />
                <span>{project.completedAt || project.created_at || ''}</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-4 text-lg">{project.description}</p>

            {/* Skills */}
            {project.skill && project.skill.length > 0 && (
              <div className="mb-6">
                <div className="font-bold mb-2 text-sm text-gray-700 dark:text-gray-200">المهارات المستخدمة:</div>
                <div className="flex flex-wrap gap-2">
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
              </div>
            )}

            {/* Services */}
            {project.services && project.services.length > 0 && (
              <div className="mb-6">
                <div className="font-bold mb-2 text-sm text-gray-700 dark:text-gray-200">الخدمات المرتبطة:</div>
                <ul className="space-y-2">
                  {project.services.map((service: any) => (
                    <li key={service.id} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-xs">
                      <div className="font-semibold mb-1">{service.name}</div>
                      <div className="text-muted-foreground mb-1">{service.small_description}</div>
                      <div className="text-gray-600 dark:text-gray-300 mb-1">{service.description}</div>
                      {service.image && (
                        <img src={service.image.startsWith('http') ? service.image : `${apiBaseUrl}/storage/${service.image}`} alt={service.name} className="w-12 h-12 rounded mt-2" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* روابط إضافية أو معلومات أخرى يمكن إضافتها هنا */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetails; 