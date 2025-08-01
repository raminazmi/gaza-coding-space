import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiArrowRight } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900" dir="rtl">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">الصفحة غير موجودة</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
        </div>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
          <FiHome className="w-5 h-5" />
          العودة للرئيسية
          <FiArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
