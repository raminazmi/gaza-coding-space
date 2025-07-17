import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiStar, FiSearch } from 'react-icons/fi';
import ServiceCardSkeleton from '@/components/ui/ServiceCardSkeleton';
import { apiBaseUrl } from '@/lib/utils';

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBaseUrl}/api/service`)
      .then(res => res.json())
      .then(data => setServices(data.services || []))
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

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (service.small_description && service.small_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (service.user_description && service.user_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen py-16 bg-gradient-hero" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
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
            onChange={e => setSearchQuery(e.target.value)}
            dir="rtl"
          />
          <FiSearch className="absolute right-4 top-3.5 text-gray-400 text-xl" />
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        ) : filteredServices.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-16 h-16 rounded-xl object-cover bg-gradient-primary"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                        <FiStar className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-bold">{service.name}</h3>
                      <p className="text-muted-foreground text-sm">{service.category_id ? getCategoryName(service.category_id) : ''}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-2 leading-relaxed">{service.small_description}</p>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">{service.user_description}</p>
                  <div className="mb-6 text-gray-600 dark:text-gray-300 whitespace-pre-line text-xs">{service.description}</div>

                  <div className="border-t pt-6">
                    <Link
                      to={`/order-service?service_id=${service.id}`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-gradient-primary text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                    >
                      اطلب الخدمة الآن
                      <FiArrowLeft className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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