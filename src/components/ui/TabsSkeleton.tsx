import React from 'react';

const TabsSkeleton = () => (
  <div className="mb-8">
    <div className="flex gap-3 justify-start overflow-x-auto pb-4 portfolio-tabs-scroll">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-lg flex-shrink-0 shimmer" />
      ))}
    </div>
  </div>
);

export default TabsSkeleton; 