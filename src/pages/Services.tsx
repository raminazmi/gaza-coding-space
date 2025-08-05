import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiStar, FiSearch } from 'react-icons/fi';
import ServiceCardSkeleton from '@/components/ui/ServiceCardSkeleton';
import Pagination from '@/components/ui/pagination'; // استيراد مكون الترقيم
import { motion } from 'framer-motion'; // استيراد framer-motion
import { apiBaseUrl } from '@/lib/utils';

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setCategoriesLoading(true);
    fetch(`${apiBaseUrl}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const fetchServices = async (page: number) => {
    setLoading(true);
    const url = `${apiBaseUrl}/api/service?page=${page}&per_page=8${searchQuery ? `&search=${searchQuery}` : ''}`;
    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log('API Response:', data);

      if (Array.isArray(data.services)) {
        setServices(data.services);
        if (data.meta) {
          setTotalPages(data.meta.last_page || 1);
          setCurrentPage(data.meta.current_page || page);
        }
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setServices([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchServices(1);
  }, [searchQuery]);

  useEffect(() => {
    fetchServices(currentPage);
  }, [currentPage]);

  const getCategoryName = (id: number | string) => {
    const cat = categories.find((c: any) => String(c.id) === String(id));
    return cat ? cat.name : id;
  };

  const isLoading = loading || categoriesLoading;

  const filteredServices = services; // البحث يتم الآن في الـ Backend

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
            خدماتنا
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            حلول برمجية متكاملة وخدمات تقنية احترافية
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mt-8 mb-8">
          <input
            type="text"
            placeholder="ابحث عن خدمة..."
            className="w-full py-3 px-5 pr-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            dir="rtl"
          />
          <FiSearch className="absolute right-4 top-3.5 text-gray-400 text-xl" />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        ) : filteredServices.length > 0 ? (
          <div>
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {filteredServices.map((service) => (
                <motion.div
                  key={service.id}
                  variants={item}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                >
                  {/* Service Header */}
                  <div className="relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                        <Link
                          to={`/order-service?service_id=${service.id}`}
                          className="bg-primary text-white p-2 rounded-full hover:bg-primary-hover transition-colors shadow-lg"
                          title="طلب الخدمة"
                        >
                          <FiArrowLeft className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 left-2">
                      <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                        <span className="text-xs">{service.category_id ? getCategoryName(service.category_id) : ''}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Service Description */}
                    <div className="mb-4">
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm line-clamp-3">
                        {service.small_description}
                      </p>
                    </div>

                    {/* User Description */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-accent to-orange-500 rounded-full"></div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">ماذا نقدم لك</h4>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
                        {service.user_description}
                      </p>
                    </div>

                    {/* Features Section */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">المميزات</h4>
                      </div>
                      <div className="space-y-1">
                        {service.description.split('.').slice(0, 3).map((feature, index) => (
                          feature.trim() && (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-1">
                                {feature.trim()}
                              </p>
                            </div>
                          )
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                      <Link
                        to={`/order-service?service_id=${service.id}`}
                        className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-sm"
                      >
                        اطلب الخدمة الآن
                        <FiArrowLeft className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg max-w-md mx-auto">
              <div className="text-6xl mb-4">🛠️</div>
              <h3 className="text-xl font-bold mb-2">لا توجد خدمات متاحة حالياً</h3>
              <p className="text-muted-foreground mb-6">
                سنقوم بإضافة خدمات جديدة قريباً. تواصل معنا لمعرفة المزيد!
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                تواصل معنا
                <FiArrowLeft className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;