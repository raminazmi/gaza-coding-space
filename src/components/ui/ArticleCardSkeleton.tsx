import React from 'react';

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

const ArticleCardSkeleton = () => (
  <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 animate-pulse relative overflow-hidden">
    <style>{shimmer}</style>
    {/* صورة وهمية */}
    <div
      className="w-full h-48 rounded-xl mb-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700"
      style={{
        backgroundSize: '800px 100%',
        animation: 'shimmer 1.5s infinite linear',
      }}
    />
    {/* عنوان */}
    <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4" style={{ animation: 'shimmer 1.5s infinite linear' }} />
    {/* وصف */}
    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" style={{ animation: 'shimmer 1.5s infinite linear' }} />
    <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded mb-4" style={{ animation: 'shimmer 1.5s infinite linear' }} />
    {/* بيانات */}
    <div className="flex gap-3 mb-4">
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
    </div>
    {/* زر وهمي */}
    <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-lg mt-6 mx-auto" style={{ animation: 'shimmer 1.5s infinite linear' }} />
  </div>
);

export default ArticleCardSkeleton; 