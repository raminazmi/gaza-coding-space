import React from 'react';

const Loading = ({ text = 'جاري التحميل...' }: { text?: string }) => (
  <div className="flex flex-col items-center justify-center w-full" dir="rtl">
    <span className="relative flex h-12 w-12 mb-3">
      <span className="absolute inline-flex h-full w-full rounded-full bg-gradient-to-tr from-blue-400 via-indigo-400 to-pink-300 opacity-20"></span>
      <span className="animate-spin relative inline-flex rounded-full h-12 w-12 border-4 border-t-blue-500 border-b-indigo-400 border-l-transparent border-r-transparent"></span>
    </span>
    <span className="text-sm text-gray-600 font-medium mt-1">{text}</span>
  </div>
);

export default Loading;
