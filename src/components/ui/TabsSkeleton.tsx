import React from 'react';

const TabsSkeleton = () => (
  <div className="flex gap-4 justify-center mb-8 flex-wrap animate-pulse">
    {[1,2,3].map(i => (
      <div key={i} className="h-12 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    ))}
  </div>
);

export default TabsSkeleton; 