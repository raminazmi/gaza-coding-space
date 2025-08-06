import React from 'react';

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

const ProjectDetailsSkeleton = () => (
  <div className="min-h-screen bg-gradient-hero py-8" dir="rtl">
    <style>{shimmer}</style>
    <div className="container max-w-7xl mx-auto px-4">
      {/* Breadcrumb skeleton */}
      <div className="mb-6">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
            {/* Hero Section */}
            <div className="relative">
              <div className="w-full h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700" style={{ animation: 'shimmer 1.5s infinite linear' }} />
              
              {/* Project URL button skeleton */}
              <div className="absolute top-4 left-4">
                <div className="w-10 h-10 bg-white rounded-full shadow-lg" style={{ animation: 'shimmer 1.5s infinite linear' }} />
              </div>

              {/* Project info overlay skeleton */}
              <div className="absolute bottom-4 right-4 left-4">
                <div className="h-8 w-3/4 bg-white/20 backdrop-blur-sm rounded mb-2" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                <div className="flex items-center gap-4">
                  <div className="h-4 w-24 bg-white/20 backdrop-blur-sm rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-4 w-20 bg-white/20 backdrop-blur-sm rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-4 w-16 bg-white/20 backdrop-blur-sm rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="p-6">
              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                </div>
                <div className="space-y-3">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                </div>
              </div>

              {/* Images Gallery */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-40 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-lg" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  ))}
                </div>
              </div>

              {/* Skills Section */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-10 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-lg" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  ))}
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Only visible on large screens */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sticky top-20 max-h-[calc(100vh-6rem)] overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" style={{ animation: 'shimmer 1.5s infinite linear' }} />
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)] pr-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3">
                  <div className="flex justify-center mb-3">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 rounded-lg" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                    <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" style={{ animation: 'shimmer 1.5s infinite linear' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default ProjectDetailsSkeleton; 