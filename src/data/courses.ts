export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    name: string;
    avatar: string;
    bio: string;
  };
  thumbnail: string;
  duration: number; // بالساعات
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  rating: number;
  reviewsCount: number;
  category: string;
  tags: string[];
  lessons: {
    id: string;
    title: string;
    duration: number; // بالدقائق
    isCompleted?: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
  language: 'ar';
  isPopular?: boolean;
  isFree?: boolean;
}

export const courses: Course[] = [
  {
    id: '1',
    title: 'تطوير تطبيقات الويب الحديثة',
    description: 'تعلم تطوير تطبيقات الويب الحديثة باستخدام React.js و TypeScript مع أفضل الممارسات والأدوات الحديثة',
    instructor: {
      name: 'محمود إبراهيم البطران',
      avatar: '/placeholder.svg',
      bio: 'مطور برمجيات خبير بأكثر من 8 سنوات في تطوير تطبيقات الويب',
    },
    thumbnail: '/placeholder.svg',
    duration: 40,
    level: 'intermediate',
    price: 199,
    rating: 4.8,
    reviewsCount: 230,
    category: 'تطوير الويب',
    tags: ['React', 'TypeScript', 'JavaScript', 'CSS'],
    lessons: [
      {
        id: '1-1',
        title: 'مقدمة في React.js',
        duration: 45,
      },
      {
        id: '1-2',
        title: 'TypeScript الأساسيات',
        duration: 60,
        },
    ],
    createdAt: '2024-01-15',
    updatedAt: '2024-07-06',
    language: 'ar',
    isPopular: true,
    isFree: false,
  },
  {
    id: '2',
    title: 'تطوير تطبيقات الهاتف الذكي',
    description: 'تعلم تطوير تطبيقات الهاتف الذكي باستخدام React Native',
    instructor: {
      name: 'أحمد محمد',
      avatar: '/placeholder.svg',
      bio: 'مطور تطبيقات الهاتف المحمول',
    },
    thumbnail: '/placeholder.svg',
    duration: 35,
    level: 'beginner',
    price: 149,
    rating: 4.6,
    reviewsCount: 180,
    category: 'تطوير التطبيقات',
    tags: ['React Native', 'JavaScript', 'Mobile'],
    lessons: [
      {
        id: '2-1',
        title: 'أساسيات React Native',
        duration: 50,
        },
    ],
    createdAt: '2024-02-01',
    updatedAt: '2024-07-05',
    language: 'ar',
    isPopular: false,
    isFree: false,
  },
];