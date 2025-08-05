import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiExternalLink, FiArrowRight, FiTag, FiCalendar, FiChevronDown, FiChevronUp, FiInfo, FiImage, FiEye, FiX, FiArrowLeft } from 'react-icons/fi';
import ProjectCardSkeleton from '@/components/ui/ProjectCardSkeleton';
import { apiBaseUrl } from '@/lib/utils';
import { useAppDispatch } from '@/hooks';
import { setPortfolioData } from '@/store/slices/breadcrumbSlice';

const PortfolioDetails = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedServices, setExpandedServices] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/project`)
      .then(res => res.json())
      .then(data => {
        const found = (data.projects || []).find((p: any) => String(p.id) === String(id));
        setProject(found || null);
        
        // Set breadcrumb data for portfolio
        if (found) {
          dispatch(setPortfolioData({
            title: found.name,
            id: String(found.id)
          }));
        }
      })
      .finally(() => setLoading(false));
  }, [id, dispatch]);

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
    <div className="min-h-screen bg-gradient-hero py-8" dir="rtl">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors text-sm">
            <FiArrowRight className="h-4 w-4" />
            العودة للأعمال
          </Link>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden">
              {/* Hero Section */}
              <div className="relative">
                <img
                  src={project.images && project.images.length > 0 
                    ? (project.images[0].image.startsWith('http') ? project.images[0].image : `${apiBaseUrl}/storage/${project.images[0].image}`)
                    : project.image
                  }
                  alt={project.name}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                {project.project_url && (
                  <a
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 left-4 bg-white text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                    title="مشاهدة المشروع"
                  >
                    <FiExternalLink className="h-4 w-4" />
                  </a>
                )}
                <div className="absolute bottom-4 right-4 left-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4" />
                      <span className="text-sm">{project.completedAt || project.created_at || ''}</span>
                    </div>
                    {project.skill && (
                      <div className="flex items-center gap-2">
                        <FiTag className="h-4 w-4" />
                        <span className="text-sm">{project.skill.length} مهارة</span>
                      </div>
                    )}
                    {project.images && (
                      <div className="flex items-center gap-2">
                        <FiImage className="h-4 w-4" />
                        <span className="text-sm">{project.images.length} صورة</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Sections */}
              <div className="p-6">
                {/* Description */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FiInfo className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">وصف المشروع</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {project.description || 'لا يوجد وصف متاح لهذا المشروع'}
                  </p>
                </div>

                {/* Images Gallery Section */}
                {project.images && project.images.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FiImage className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        معرض الصور
                      </h2>
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                        {project.images.length} صورة
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                      {project.images.slice(0, 8).map((img: any, index: number) => (
                        <div 
                          key={img.id} 
                          className="group relative overflow-hidden rounded-lg cursor-pointer"
                          onClick={() => setSelectedImage(img.image.startsWith('http') ? img.image : `${apiBaseUrl}/storage/${img.image}`)}
                        >
                          <img 
                            src={img.image.startsWith('http') ? img.image : `${apiBaseUrl}/storage/${img.image}`} 
                            alt={`صورة ${project.name}`} 
                            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                            <FiEye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        </div>
                      ))}
                      
                      {/* Show remaining images count overlay */}
                      {project.images.length > 8 && (
                        <div 
                          className="group relative overflow-hidden rounded-lg cursor-pointer"
                          onClick={() => setSelectedImage(project.images[8].image.startsWith('http') ? project.images[8].image : `${apiBaseUrl}/storage/${project.images[8].image}`)}
                        >
                          <img 
                            src={project.images[8].image.startsWith('http') ? project.images[8].image : `${apiBaseUrl}/storage/${project.images[8].image}`} 
                            alt={`صورة ${project.name}`} 
                            className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-60 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-white text-2xl font-bold mb-1">+{project.images.length - 8}</div>
                              <div className="text-white text-xs opacity-90">صور إضافية</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {project.skill && project.skill.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                      <FiTag className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                        المهارات المستخدمة
                      </h2>
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                        {project.skill.length}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      {project.skill.map((tech: any) => (
                        <div
                          key={tech.id}
                          className="flex items-center gap-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium shadow-sm border border-gray-200 dark:border-gray-600"
                        >
                          {tech.image && (
                            <img 
                              src={tech.image.startsWith('http') ? tech.image : `${apiBaseUrl}/storage/${tech.image}`} 
                              alt={tech.name} 
                              className="w-6 h-6 rounded-full object-cover" 
                            />
                          )}
                          <FiTag className="h-4 w-4 text-primary" />
                          <span>{tech.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Services Section - Hidden on large screens */}
                {project.services && project.services.length > 0 && (
                  <div className="mb-6 lg:hidden">
                    <button
                      onClick={() => setExpandedServices(!expandedServices)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiInfo className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          الخدمات المرتبطة
                        </h2>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                          {project.services.length}
                        </span>
                      </div>
                      {expandedServices ? (
                        <FiChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <FiChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedServices && (
                      <div className="mt-4 space-y-4">
                        {project.services.map((service: any) => (
                          <div key={service.id} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-4">
                            <div className="flex items-start gap-4">
                              {service.image && (
                                <img 
                                  src={service.image.startsWith('http') ? service.image : `${apiBaseUrl}/storage/${service.image}`} 
                                  alt={service.name} 
                                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0 shadow-md" 
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{service.name}</h3>
                                {service.small_description && (
                                  <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm leading-relaxed">{service.small_description}</p>
                                )}
                                {service.description && (
                                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{service.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Info Section */}
                <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-6 border border-primary/20">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">معلومات إضافية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4 text-primary" />
                      <span className="text-gray-600 dark:text-gray-300">تاريخ الإنشاء: {project.created_at || 'غير محدد'}</span>
                    </div>
                    {project.project_url && (
                      <div className="flex items-center gap-2">
                        <FiExternalLink className="h-4 w-4 text-primary" />
                        <a 
                          href={project.project_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary-hover transition-colors"
                        >
                          رابط المشروع
                        </a>
                      </div>
                    )}
                    {project.images && (
                      <div className="flex items-center gap-2">
                        <FiImage className="h-4 w-4 text-primary" />
                        <span className="text-gray-600 dark:text-gray-300">عدد الصور: {project.images.length}</span>
                      </div>
                    )}
                    {project.services && (
                      <div className="flex items-center gap-2">
                        <FiInfo className="h-4 w-4 text-primary" />
                        <span className="text-gray-600 dark:text-gray-300">عدد الخدمات: {project.services.length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Only visible on large screens */}
          {project.services && project.services.length > 0 && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden">
                <div className="flex items-center gap-3 mb-6">
                  <FiInfo className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    الخدمات المرتبطة
                  </h2>
                  <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                    {project.services.length}
                  </span>
                </div>
                
                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
                  {project.services.map((service: any) => (
                    <div key={service.id} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-3">
                      {service.image && (
                        <div className='flex justify-center items-center gap-2 mb-3'>
                        <img
                          src={service.image.startsWith('http') ? service.image : `${apiBaseUrl}/storage/${service.image}`}
                          alt={service.name}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0 shadow-md"
                          />
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{service.name}</h3>
                          {service.small_description && (
                            <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm leading-relaxed line-clamp-3">{service.small_description}</p>
                          )}
                          {service.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-4">{service.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            {/* Navigation Arrows */}
            {project.images && project.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = project.images.findIndex((img: any) =>
                      (img.image.startsWith('http') ? img.image : `${apiBaseUrl}/storage/${img.image}`) === selectedImage
                    );
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : project.images.length - 1;
                    const prevImage = project.images[prevIndex].image.startsWith('http')
                      ? project.images[prevIndex].image
                      : `${apiBaseUrl}/storage/${project.images[prevIndex].image}`;
                    setSelectedImage(prevImage);
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg z-10"
                  title="الصورة السابقة"
                >
                  <FiArrowLeft className="h-6 w-6" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = project.images.findIndex((img: any) =>
                      (img.image.startsWith('http') ? img.image : `${apiBaseUrl}/storage/${img.image}`) === selectedImage
                    );
                    const nextIndex = currentIndex < project.images.length - 1 ? currentIndex + 1 : 0;
                    const nextImage = project.images[nextIndex].image.startsWith('http')
                      ? project.images[nextIndex].image
                      : `${apiBaseUrl}/storage/${project.images[nextIndex].image}`;
                    setSelectedImage(nextImage);
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg z-10"
                  title="الصورة التالية"
                >
                  <FiArrowRight className="h-6 w-6" />
                </button>
              </>
            )}
            <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
              
              <div className=" rounded-xl relative max-w-full max-h-full overflow-auto scrollbar-hide">
                <img 
                  src={selectedImage} 
                  alt="صورة مكبرة" 
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>
              

              
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 bg-white text-gray-900 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg z-10"
                title="إغلاق"
              >
                <FiX className="h-5 w-5" />
              </button>
              
              {/* Image Counter */}
              {project.images && project.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                  {project.images.findIndex((img: any) => 
                    (img.image.startsWith('http') ? img.image : `${apiBaseUrl}/storage/${img.image}`) === selectedImage
                  ) + 1} / {project.images.length}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioDetails; 