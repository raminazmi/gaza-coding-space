import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  useEffect(() => {
    document.title = 'الصفحة غير موجودة';
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background" dir="rtl">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">عذراً، الصفحة غير موجودة</p>
      <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">العودة للرئيسية</a>
    </div>
  );
};

export default NotFound;
