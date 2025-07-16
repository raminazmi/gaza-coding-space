import React from 'react';

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

const SkeletonBox = ({ className }: { className?: string }) => (
  <div
    className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse ${className}`}
    style={{
      backgroundSize: '800px 100%',
      animation: 'shimmer 1.5s infinite linear',
    }}
  />
);

const CourseDetailsSkeleton = () => (
  <div className="min-h-screen bg-gray-50" dir="rtl">
    <style>{shimmer}</style>
    {/* Header Skeleton */}
    <div className="w-full py-10 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-100 mb-8 animate-pulse">
      <div className="container max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8 items-center">
        <SkeletonBox className="w-full max-w-md h-48 md:h-64 rounded-xl shadow-2xl mb-4 md:mb-0" />
        <div className="flex-1 space-y-4">
          <SkeletonBox className="h-8 w-2/3 rounded mb-2" />
          <SkeletonBox className="h-4 w-full rounded mb-2" />
          <SkeletonBox className="h-4 w-5/6 rounded mb-4" />
          <div className="flex gap-3">
            <SkeletonBox className="h-4 w-24 rounded" />
            <SkeletonBox className="h-4 w-20 rounded" />
            <SkeletonBox className="h-4 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
    {/* Main Content Skeleton */}
    <div className="container max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      {/* Main Section */}
      <main className="lg:w-2/3 w-full space-y-8">
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <SkeletonBox className="h-6 w-1/3 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonBox key={i} className="h-4 w-full rounded" />
            ))}
          </div>
          <div className="flex gap-4 mt-6">
            <SkeletonBox className="h-10 w-32 rounded-lg" />
            <SkeletonBox className="h-10 w-32 rounded-lg" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <SkeletonBox className="h-6 w-1/4 rounded mb-4" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <SkeletonBox key={i} className="h-4 w-2/3 rounded" />
            ))}
          </div>
        </div>
      </main>
      {/* Sidebar Skeleton */}
      <aside className="md:w-1/4 w-full bg-white p-4 rounded-2xl shadow-xl mb-4 md:mb-0 animate-pulse">
        <SkeletonBox className="h-6 w-1/2 rounded mb-6" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonBox key={i} className="h-4 w-full rounded" />
          ))}
        </div>
        <SkeletonBox className="h-10 w-full rounded-lg mt-8" />
      </aside>
    </div>
  </div>
);

export default CourseDetailsSkeleton; 