import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center mt-8 gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-xl ${currentPage === 1 ? 'bg-gray-300' : 'bg-gradient-primary text-white'}`}
      >
        السابق
      </button>
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-xl ${
            currentPage === page
              ? 'bg-gradient-primary text-white'
              : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-xl ${currentPage === totalPages ? 'bg-gray-300' : 'bg-gradient-primary text-white'}`}
      >
        التالي
      </button>
    </div>
  );
};

export default Pagination;