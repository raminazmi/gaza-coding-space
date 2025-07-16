import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiArrowLeft, FiDollarSign, FiClock, FiStar } from 'react-icons/fi';
import { services } from '@/data/services';
import { apiBaseUrl } from '@/lib/utils';

const Services = () => {
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

        {services.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div 
                key={service.id} 
                className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                      <FiStar className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{service.title}</h3>
                      <p className="text-muted-foreground text-sm">{service.category}</p>
                  </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">{service.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <FiCheck className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                      ))}
                  </div>

                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="h-5 w-5 text-primary" />
                        <span className="text-2xl font-bold text-primary">
                          ${service.price.starting}
                        </span>
                        <span className="text-sm text-muted-foreground">ابتداءً من</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FiClock className="h-4 w-4" />
                        <span>{service.duration}</span>
                      </div>
                    </div>
                    
                    {service.isPopular && (
                      <div className="bg-gradient-primary text-white text-center py-2 rounded-lg mb-4">
                        الخدمة الأكثر طلباً
                      </div>
                    )}
                    
                    <Link 
                      to="/contact"
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