import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiExternalLink, FiArrowRight, FiTag, FiCalendar, FiChevronDown, FiChevronUp, FiInfo, FiImage, FiEye, FiX, FiArrowLeft, FiCheck, FiStar, FiUsers, FiClock } from 'react-icons/fi';
import ServiceDetailsSkeleton from '@/components/ui/ServiceDetailsSkeleton';
import { apiBaseUrl } from '@/lib/utils';
import { useAppDispatch } from '@/hooks';
import { setServiceData, clearServiceData } from '@/store/slices/breadcrumbSlice';

const ServiceDetails = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [service, setService] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${apiBaseUrl}/api/service`),
      fetch(`${apiBaseUrl}/api/categories`)
    ])
      .then(([serviceRes, categoriesRes]) => Promise.all([serviceRes.json(), categoriesRes.json()]))
      .then(([serviceData, categoriesData]) => {
        const found = (serviceData.services || []).find((s: any) => String(s.id) === String(id));
        setService(found || null);
        setCategories(categoriesData.data || []);
        
        // Set breadcrumb data for service
        if (found) {
          dispatch(setServiceData({
            name: found.name,
            id: String(found.id)
          }));
        } else {
          // Clear service breadcrumb if service not found
          dispatch(clearServiceData());
        }
      })
      .catch(error => {
        console.error('Error loading service:', error);
        setService(null);
        // Clear service breadcrumb on error
        dispatch(clearServiceData());
      })
      .finally(() => setLoading(false));
  }, [id, dispatch]);

  const getCategoryName = (id: number | string) => {
    const cat = categories.find((c: any) => String(c.id) === String(id));
    return cat ? cat.name : id;
  };

  // Cleanup breadcrumb when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearServiceData());
    };
  }, [dispatch]);

  if (loading) {
    return <ServiceDetailsSkeleton />;
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-6xl mb-4">🛠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">الخدمة غير موجودة</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">الخدمة التي تبحث عنها غير موجودة أو قد تم إزالتها</p>
          <button
            onClick={() => navigate('/services')}
            className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تصفح الخدمات
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
          <Link to="/services" className="inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold transition-colors text-sm">
            <FiArrowRight className="h-4 w-4" />
            العودة للخدمات
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
                  src={service.image}
                  alt={service.name}
                                     className="w-full h-80 object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                <div className="absolute top-4 left-4 flex gap-2">
                                     <div className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                     {getCategoryName(service.category_id) || 'خدمة تقنية'}
                   </div>
                  {service.project_count > 0 && (
                    <div className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {service.project_count} مشروع
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 left-4">
                  <h1 className="text-3xl font-bold text-white mb-2">{service.name}</h1>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <FiStar className="h-4 w-4" />
                      <span className="text-sm">خدمة مميزة</span>
                    </div>
                    {service.price && (
                      <div className="flex items-center gap-2">
                        <FiTag className="h-4 w-4" />
                        <span className="text-sm">ابتداءً من ${service.price.starting}</span>
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
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">وصف الخدمة</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {service.small_description || 'لا يوجد وصف متاح لهذه الخدمة'}
                  </p>
                </div>

                {/* User Description */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FiUsers className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">ماذا نقدم لك</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                    {service.user_description || 'نقدم حلولاً متكاملة ومخصصة لاحتياجاتك'}
                  </p>
                </div>

                {/* Features Section */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FiCheck className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">المميزات</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.description && service.description.split('.').map((feature: string, index: number) => (
                      feature.trim() && (
                        <div key={index} className="flex items-start gap-3 p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                            {feature.trim()}
                          </p>
                        </div>
                      )
                    ))}
                  </div>
                </div>

                {/* Technologies Section - If available */}
                {service.projects && service.projects.length > 0 && service.projects.some((p: any) => p.skill && p.skill.length > 0) && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiTag className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">التقنيات المستخدمة</h2>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {Array.from(new Set(
                        service.projects
                          .flatMap((p: any) => p.skill || [])
                          .map((s: any) => s.name)
                      )).slice(0, 8).map((skillName: any, index: number) => (
                        <span
                          key={index}
                          className="bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary dark:text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium border border-primary/20"
                        >
                          {skillName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section - Hidden on large screens */}
                {service.projects && service.projects.length > 0 && (
                  <div className="mb-6 lg:hidden">
                    <button
                      onClick={() => setExpandedProjects(!expandedProjects)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiImage className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          الأعمال المرتبطة
                        </h2>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                          {service.projects.length}
                        </span>
                      </div>
                      {expandedProjects ? (
                        <FiChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <FiChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    
                                         {expandedProjects && (
                       <div className="mt-4 space-y-4">
                         {service.projects.map((project: any) => (
                           <div key={project.id} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-4">
                             <div className="flex items-start gap-4">
                               {project.image && project.image !== "https://gazacodingspace.mahmoudalbatran.com/storage" && (
                                 <img 
                                   src={project.image.startsWith('http') ? project.image : `${apiBaseUrl}/storage/${project.image}`} 
                                   alt={project.name} 
                                   className="w-16 h-16 rounded-lg object-cover object-top flex-shrink-0 shadow-md" 
                                 />
                               )}
                               <div className="flex-1">
                                 <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{project.name}</h3>
                                 {project.description && (
                                   <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm leading-relaxed">{project.description}</p>
                                 )}
                                 {project.skill && project.skill.length > 0 && (
                                   <div className="flex flex-wrap gap-2 mb-3">
                                     {project.skill.slice(0, 3).map((skill: any) => (
                                       <span key={skill.id} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">
                                         {skill.name}
                                       </span>
                                     ))}
                                     {project.skill.length > 3 && (
                                       <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                                         +{project.skill.length - 3}
                                       </span>
                                     )}
                                   </div>
                                 )}
                                 <Link
                                   to={`/portfolio/${project.id}`}
                                   className="inline-flex items-center gap-2 text-primary hover:text-primary-hover text-sm font-semibold"
                                 >
                                   عرض المشروع
                                   <FiArrowLeft className="h-4 w-4" />
                                 </Link>
                               </div>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                  </div>
                )}

                {/* Courses Section - Hidden on large screens */}
                {service.courses && service.courses.length > 0 && (
                  <div className="mb-6 lg:hidden">
                    <button
                      onClick={() => setExpandedCourses(!expandedCourses)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FiClock className="h-5 w-5 text-primary" />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                          الدورات المرتبطة
                        </h2>
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                          {service.courses.length}
                        </span>
                      </div>
                      {expandedCourses ? (
                        <FiChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <FiChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedCourses && (
                      <div className="mt-4 space-y-4">
                        {service.courses.map((course: any) => (
                          <div key={course.id} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-4">
                            <div className="flex items-start gap-4">
                              {course.image && (
                                <img 
                                  src={course.image.startsWith('http') ? course.image : `${apiBaseUrl}/storage/${course.image}`} 
                                  alt={course.name} 
                                  className="w-16 h-16 rounded-lg object-cover object-top flex-shrink-0 shadow-md" 
                                />
                              )}
                              <div className="flex-1">
                                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">{course.name}</h3>
                                {course.description && (
                                  <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm leading-relaxed">{course.description}</p>
                                )}
                                <Link
                                  to={`/courses/${course.id}`}
                                  className="inline-flex items-center gap-2 text-primary hover:text-primary-hover text-sm font-semibold"
                                >
                                  عرض الدورة
                                  <FiArrowLeft className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Manager Info Section */}
                {service.manager && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <FiUsers className="h-5 w-5 text-primary" />
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">مدير الخدمة</h2>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={service.manager.profile_photo_url}
                          alt={service.manager.name}
                          className="w-16 h-16 rounded-full object-cover shadow-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">{service.manager.name}</h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{service.manager.email}</p>
                          <div className="flex items-center gap-2">
                            <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                              {service.manager.role === 'Teacher' ? 'مدرب' : service.manager.role}
                            </span>
                            {service.manager.email_verified_at && (
                              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-xs font-medium">
                                موثق
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Info Section */}
                <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-6 border border-primary/20">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">معلومات إضافية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FiCalendar className="h-4 w-4 text-primary" />
                      <span className="text-gray-600 dark:text-gray-300">تاريخ الإنشاء: {service.created_at || 'غير محدد'}</span>
                    </div>
                    {service.price && (
                      <div className="flex items-center gap-2">
                        <FiTag className="h-4 w-4 text-primary" />
                        <span className="text-gray-600 dark:text-gray-300">السعر: ابتداءً من ${service.price.starting}</span>
                      </div>
                    )}
                    {service.project_count > 0 && (
                      <div className="flex items-center gap-2">
                        <FiImage className="h-4 w-4 text-primary" />
                        <span className="text-gray-600 dark:text-gray-300">عدد المشاريع: {service.project_count}</span>
                      </div>
                    )}
                    {service.courses && (
                      <div className="flex items-center gap-2">
                        <FiClock className="h-4 w-4 text-primary" />
                        <span className="text-gray-600 dark:text-gray-300">عدد الدورات: {service.courses.length}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 flex justify-center">
                  <Link
                    to={`/order-service?service_id=${service.id}`}
                    className="inline-flex items-center gap-3 bg-gradient-primary text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 text-lg"
                  >
                    اطلب الخدمة الآن
                    <FiArrowLeft className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Only visible on large screens */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden">
                              {/* Related Projects */}
                {service.projects && service.projects.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <FiImage className="h-6 w-6 text-primary" />
                      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        الأعمال المرتبطة
                      </h2>
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                        {service.projects.length}
                      </span>
                    </div>
                    
                    <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
                      {service.projects.map((project: any) => (
                        <div key={project.id} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-3">
                                                     {project.image && project.image !== "https://gazacodingspace.mahmoudalbatran.com/storage" && (
                             <div className='flex justify-center items-center gap-2 mb-3'>
                               <img
                                 src={project.image.startsWith('http') ? project.image : `${apiBaseUrl}/storage/${project.image}`}
                                 alt={project.name}
                                 className="w-24 h-24 rounded-lg object-cover object-top flex-shrink-0 shadow-md"
                               />
                             </div>
                           )}
                          <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{project.name}</h3>
                              {project.description && (
                                <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm leading-relaxed line-clamp-3">{project.description}</p>
                              )}
                              {project.skill && project.skill.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {project.skill.slice(0, 2).map((skill: any) => (
                                    <span key={skill.id} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                                      {skill.name}
                                    </span>
                                  ))}
                                  {project.skill.length > 2 && (
                                    <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                                      +{project.skill.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                              <Link
                                to={`/portfolio/${project.id}`}
                                className="inline-flex items-center gap-2 text-primary hover:text-primary-hover text-xs font-semibold"
                              >
                                عرض المشروع
                                <FiArrowLeft className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Related Courses */}
              {service.courses && service.courses.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FiClock className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                      الدورات المرتبطة
                    </h2>
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-medium">
                      {service.courses.length}
                    </span>
                  </div>
                  
                  <div className="space-y-4 overflow-y-auto max-h-64 pr-2">
                    {service.courses.map((course: any) => (
                      <div key={course.id} className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-3">
                                                 {course.image && (
                           <div className='flex justify-center items-center gap-2 mb-3'>
                             <img
                               src={course.image.startsWith('http') ? course.image : `${apiBaseUrl}/storage/${course.image}`}
                               alt={course.name}
                               className="w-24 h-24 rounded-lg object-cover object-top flex-shrink-0 shadow-md"
                             />
                           </div>
                         )}
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">{course.name}</h3>
                            {course.description && (
                              <p className="text-gray-600 dark:text-gray-300 mb-2 text-sm leading-relaxed line-clamp-3">{course.description}</p>
                            )}
                            <Link
                              to={`/courses/${course.id}`}
                              className="inline-flex items-center gap-2 text-primary hover:text-primary-hover text-xs font-semibold"
                            >
                              عرض الدورة
                              <FiArrowLeft className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="mb-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">إحصائيات سريعة</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">عدد المشاريع</span>
                    <span className="text-lg font-bold text-primary">{service.project_count || 0}</span>
                  </div>
                  {service.manager && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-300">المدير</span>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{service.manager.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300">التصنيف</span>
                                         <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{getCategoryName(service.category_id) || 'تقني'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-xl p-4 border border-primary/20">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">طلب الخدمة</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  احصل على عرض سعر مخصص لاحتياجاتك
                </p>
                <Link
                  to={`/order-service?service_id=${service.id}`}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-primary text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                >
                  اطلب الخدمة الآن
                  <FiArrowLeft className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails; 