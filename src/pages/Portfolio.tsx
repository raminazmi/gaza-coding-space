import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiExternalLink, FiArrowLeft, FiTag, FiCalendar, FiEye, FiSearch } from 'react-icons/fi';
import ProjectCardSkeleton from '@/components/ui/ProjectCardSkeleton';
import TabsSkeleton from '@/components/ui/TabsSkeleton';
import Pagination from '@/components/ui/pagination';
import { motion } from 'framer-motion';
import { apiBaseUrl } from '@/lib/utils';
import useAuth from '@/hooks/useAuth';

interface Category {
  id: number;
  name: string;
  image?: string;
  description?: string;
  small_description?: string;
}

interface Project {
  id: number;
  name: string;
  image: string;
  project_url: string | null;
  description: string;
  skill: any[];
  services: any[];
  images: any[];
  category_id?: number;
  completedAt?: string;
  created_at?: string;
}

const Portfolio = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { getToken } = useAuth();

  useEffect(() => {
    setCategoriesLoading(true);
    const token = getToken();
    fetch(`${apiBaseUrl}/api/service`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 429) {
            console.warn('Rate limit exceeded for services');
            return { services: [] };
          }
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setCategories(data.services || []);
      })
      .catch((error) => {
        console.error('Error fetching services:', error);
        setCategories([]);
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  const fetchProjects = async (page: number) => {
    setLoading(true);
    const token = getToken();
    let url = '';

    if (selectedCategory === 'all') {
      url = `${apiBaseUrl}/api/project?page=${page}&per_page=6${searchQuery ? `&search=${searchQuery}` : ''}`;
    } else {
      url = `${apiBaseUrl}/api/project/${selectedCategory}?page=${page}&per_page=7${searchQuery ? `&search=${searchQuery}` : ''}`;
    }

    try {
      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();

      let fetchedProjects: Project[] = [];
      if (Array.isArray(data.data)) {
        fetchedProjects = data.data;
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setCurrentPage(data.meta.current_page || page);
        }
      } else if (Array.isArray(data.projects)) {
        fetchedProjects = data.projects;
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setCurrentPage(data.meta.current_page || page);
        }
      } else if (Array.isArray(data)) {
        fetchedProjects = data;
      } else if (data.project) {
        fetchedProjects = [data.project];
      }
      setProjects(fetchedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProjects(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const filteredProjects = projects;

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
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">
            أعمالنا
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            بعض من مشاريعنا وأعمالنا البرمجية المميزة
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mt-8 mb-8">
          <input
            type="text"
            placeholder="ابحث عن مشروع..."
            className="w-full py-3 px-5 pr-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            dir="rtl"
          />
          <FiSearch className="absolute right-4 top-3.5 text-gray-400 text-xl" />
        </div>

        {/* Categories Tabs */}
        {categoriesLoading ? (
          <TabsSkeleton />
        ) : (
                                <div className="flex gap-2 justify-start mb-8 overflow-x-auto pb-2 portfolio-tabs-scroll">
            <button
              className={`px-2 py-1.5 text-sm rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${selectedCategory === 'all'
                ? 'bg-gradient-primary text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700'
                }`}
              onClick={() => setSelectedCategory('all')}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-2 py-1.5 text-sm rounded-xl whitespace-nowrap transition-all flex-shrink-0 ${selectedCategory === cat.id
                  ? 'bg-gradient-primary text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : filteredProjects.length > 0 ? (
          <>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredProjects.map((project) => (
                <Link to={`/portfolio/${project.id}`} className="block">
                <motion.div
                  key={project.id}
                  variants={item}
                    className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col h-full"
                >
                  {/* Project Image */}
                  <div className="relative overflow-hidden">
                    <div className="w-full aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center relative overflow-hidden border-b border-gray-200 dark:border-gray-700">
                    <img
                      src={project.images && project.images.length > 0
                        ? (project.images[0].image.startsWith('http') ? project.images[0].image : `${apiBaseUrl}/storage/${project.images[0].image}`)
                        : project.image
                      }
                      alt={project.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-2xl">💼</span>
                        </div>
                      </div>
                      {/* Subtle overlay for better text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
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
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FiExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <Link
                          to={`/portfolio/${project.id}`}
                          className="bg-primary text-white p-2 rounded-full hover:bg-primary-hover transition-colors shadow-lg"
                          title="عرض التفاصيل"
                          onClick={(e) => e.stopPropagation()}
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

                  <div className="p-4 flex flex-col flex-1">
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

                    {/* Spacer to push button to bottom */}
                    <div className="flex-1"></div>

                    {/* Action Button */}
                    <div className="flex justify-end mt-4">
                      <Link
                        to={`/portfolio/${project.id}`}
                        className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                      >
                        عرض التفاصيل
                        <FiArrowLeft className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
                </Link>
              ))}
            </motion.div>
            {totalPages && totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </>
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