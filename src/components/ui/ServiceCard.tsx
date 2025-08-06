import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';

interface ServiceCardProps {
  service: any;
  onClick?: () => void;
  showDetails?: boolean;
  showOrderButton?: boolean;
  categoryName?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onClick, 
  showDetails = true, 
  showOrderButton = true,
  categoryName
}) => {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      {/* Service Header */}
      <div className="relative overflow-hidden">
                 <div className="w-full aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center relative overflow-hidden border-b border-gray-200 dark:border-gray-700">
           <img
             src={service.image}
             alt={service.name}
                           className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-300"
             onError={(e) => {
               e.currentTarget.style.display = 'none';
               e.currentTarget.nextElementSibling?.classList.remove('hidden');
             }}
           />
           <div className="hidden absolute inset-0 flex items-center justify-center">
             <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center shadow-lg">
               <span className="text-2xl">🛠️</span>
             </div>
           </div>
           {/* Subtle overlay for better text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
         </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
            {showDetails && (
              <Link
                to={`/services/${service.id}`}
                className="bg-primary text-white p-2 rounded-full hover:bg-primary-hover transition-colors shadow-lg"
                title="عرض التفاصيل"
                onClick={(e) => e.stopPropagation()}
              >
                <FiArrowLeft className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        <div className="absolute bottom-2 right-2 left-2">
          <h3 className="text-base font-bold text-white mb-1">{service.name}</h3>
          <div className="flex items-center justify-between text-white/90">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                             <span className="text-xs">{categoryName || service.category_id || 'خدمة تقنية'}</span>
            </div>
            {service.project_count > 0 && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="text-xs font-semibold">{service.project_count}</span>
                <span className="text-xs">مشاريع</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-3">
        {/* Service Description */}
        <div className="mb-3">
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs line-clamp-2">
            {service.small_description}
          </p>
        </div>

        {/* Manager Info */}
        {service.manager && (
          <div className="mb-3 flex items-center gap-2">
            <img
              src={service.manager.profile_photo_url}
              alt={service.manager.name}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400">{service.manager.name}</span>
            {service.manager.role === 'Teacher' && (
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">مدرب</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          {showDetails && (
            <Link
              to={`/services/${service.id}`}
              className="inline-flex items-center gap-1 text-primary hover:text-primary-hover text-xs font-semibold transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              عرض التفاصيل
              <FiArrowLeft className="h-3 w-3" />
            </Link>
          )}
          {showOrderButton && (
            <Link
              to={`/order-service?service_id=${service.id}`}
              className="inline-flex items-center gap-1 bg-gradient-primary text-white px-3 py-1.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              طلب الخدمة
              <FiArrowLeft className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 