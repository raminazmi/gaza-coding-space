import React, { useEffect, useState } from 'react';
import { apiBaseUrl } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import CourseCardSkeleton from '@/components/ui/CourseCardSkeleton';
import TabsSkeleton from '@/components/ui/TabsSkeleton';
import { FiUsers, FiBookOpen, FiDollarSign, FiSearch } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

interface Course {
  id: number;
  name: string;
  slug: string;
  discription?: string;
  description?: string;
  icon?: string;
  image?: string;
  salary?: string;
  enroll_count?: number;
  Enroll_count?: number;
  lecture_count?: number;
  Lecture_count?: number;
  user?: string;
  userImage?: string;
  category?: Category;
}

const Courses = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | number>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setCategoriesLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${apiBaseUrl}/api/categories`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => setCategories(data.data || []))
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const url = selectedCategory === 'all'
      ? `${apiBaseUrl}/api/courses`
      : `${apiBaseUrl}/api/courses/${selectedCategory}`;
    
    fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.data)) {
          setCourses(data.data);
        } else if (data.course) {
          setCourses([data.course]);
        } else {
          setCourses([]);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pt-0 pb-16" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="h1 bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">
            دوراتنا التدريبية
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl mx-auto">
            اكتشف دوراتنا المميزة المصممة لتطوير مهاراتك وتأهيلك لسوق العمل
          </p>
          
          <div className="relative max-w-2xl mx-auto mt-8">
            <input
              type="text"
              placeholder="ابحث عن دورة..."
              className="w-full py-3 px-5 pr-12 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute right-4 top-3.5 text-gray-400 text-xl" />
          </div>
        </div>

        {categoriesLoading ? (
          <TabsSkeleton />
        ) : (
          <div className="flex gap-2 justify-start mb-8 overflow-x-auto pb-4 scrollbar-hide">
            <button
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === 'all' 
                  ? 'bg-gradient-primary text-white shadow-lg' 
                  : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => setSelectedCategory('all')}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat.id 
                    ? 'bg-gradient-primary text-white shadow-lg' 
                    : 'bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-200 dark:border-gray-700'
                }`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FiSearch className="text-gray-500 text-4xl" />
            </div>
            <h3 className="text-xl font-bold mb-2">لا توجد دورات متاحة</h3>
            <p className="text-gray-600 dark:text-gray-300">
              لم نعثر على أي دورات تطابق بحثك. جرب تغيير الفئة أو كلمات البحث.
            </p>
            <button 
              className="mt-6 px-6 py-2 rounded-xl bg-gradient-primary text-white font-medium"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
            >
              عرض جميع الدورات
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredCourses.map(course => (
              <motion.div
                key={course.id}
                variants={item}
                className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col h-full"
                onClick={() => navigate(`/courses/${course.id}`)}
                whileHover={{ y: -5 }}
              >
              <div className="relative">
                  {(course.icon || course.image) && (
                    <img 
                      src={course.icon || course.image} 
                      alt={course.name} 
                      className="w-full h-48 object-cover" 
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    {course.category && (
                      <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {course.category.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{course.name}</h3>
                  
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <FiUsers /> {course.enroll_count ?? course.Enroll_count ?? 0} طلاب
                    </span>
                    <span className="h-1 w-1 bg-gray-400 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      <FiBookOpen /> {course.lecture_count ?? course.Lecture_count ?? 0} محاضرة
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-base mb-5 flex-1 line-clamp-2">
                    {course.discription || course.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      {course.userImage && (
                        <img src={course.userImage} alt={course.user} className="w-8 h-8 rounded-full" />
                      )}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{course.user || '-'}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-primary font-bold text-lg flex items-center gap-1">
                        <FiDollarSign />
                        {course.salary ? course.salary : 'مجاني'}
                      </span>
                      <button
                        className="rounded-xl bg-gradient-primary hover:shadow-glow px-4 py-2 text-white font-medium text-sm transition-all"
                        onClick={e => { e.stopPropagation(); navigate(`/courses/${course.id}`); }}
                      >
                        التفاصيل
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Courses;