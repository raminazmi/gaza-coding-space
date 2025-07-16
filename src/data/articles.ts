export interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  author: {
    name: string;
    avatar: string;
    bio: string;
  };
  thumbnail: string;
  category: string;
  tags: string[];
  readTime: number; // بالدقائق
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  isPopular?: boolean;
}

export const articles: Article[] = [
  {
    id: '1',
    title: 'أحدث المقالات البرمجية في عالم تطوير الويب',
    description: 'استكشف أحدث التقنيات والممارسات في تطوير تطبيقات الويب الحديثة مع React و TypeScript',
    content: 'في عالم تطوير الويب المتطور باستمرار، نشهد تطورات مذهلة في التقنيات والأدوات المستخدمة. من React إلى Vue.js، ومن TypeScript إلى WebAssembly، هناك الكثير لنتعلمه...',
    author: {
      name: 'محمود إبراهيم البطران',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      bio: 'مطور ويب محترف ومدرب تقني مع خبرة 8 سنوات في تطوير التطبيقات',
    },
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
    category: 'تطوير الويب',
    tags: ['JavaScript', 'React', 'TypeScript', 'تطوير الويب'],
    readTime: 8,
    views: 1250,
    likes: 89,
    createdAt: '2024-07-01',
    updatedAt: '2024-07-06',
    isPopular: true,
  },
  {
    id: '2',
    title: 'مستقبل الذكاء الاصطناعي في البرمجة',
    description: 'كيف سيغير الذكاء الاصطناعي من طريقة كتابة الكود والتطوير، وما هي الأدوات الجديدة المتاحة',
    content: 'الذكاء الاصطناعي يثور على عالم البرمجة. من GitHub Copilot إلى ChatGPT، نرى كيف تساعد هذه الأدوات المطورين في كتابة كود أفضل وأسرع...',
    author: {
      name: 'سارة أحمد محمد',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b80e4872?w=400&h=400&fit=crop&crop=face',
      bio: 'باحثة في الذكاء الاصطناعي وتطبيقات التعلم الآلي في البرمجة',
    },
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop',
    category: 'الذكاء الاصطناعي',
    tags: ['ذكاء اصطناعي', 'تعلم آلي', 'البرمجة', 'تقنية'],
    readTime: 12,
    views: 890,
    likes: 67,
    createdAt: '2024-06-28',
    updatedAt: '2024-07-05',
    isPopular: false
  },
  {
    id: '3',
    title: 'أفضل الممارسات في تطوير تطبيقات React',
    description: 'دليل شامل لأفضل الممارسات في تطوير تطبيقات React الحديثة مع Hooks و Context API',
    content: 'React هو أحد أهم مكتبات JavaScript لتطوير واجهات المستخدم. في هذا المقال، سنتعرف على أفضل الممارسات للحصول على تطبيقات عالية الأداء...',
    author: {
      name: 'أحمد حسن علي',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'مطور React محترف ومدرب في تطوير واجهات المستخدم',
    },
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    category: 'تطوير الواجهات',
    tags: ['React', 'JavaScript', 'واجهات المستخدم', 'تطوير'],
    readTime: 15,
    views: 1580,
    likes: 124,
    createdAt: '2024-06-15',
    updatedAt: '2024-06-20',
    isPopular: true
  },
  {
    id: '4',
    title: 'مقدمة إلى تطوير التطبيقات بـ Node.js',
    description: 'تعلم أساسيات تطوير التطبيقات الخلفية باستخدام Node.js و Express',
    content: 'Node.js قد غير طريقة تطوير التطبيقات الخلفية. في هذا المقال، سنتعلم كيفية بناء APIs قوية ومرنة...',
    author: {
      name: 'فاطمة يوسف',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      bio: 'مطورة برامج خلفية ومتخصصة في Node.js و قواعد البيانات',
    },
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    category: 'تطوير الخادم',
    tags: ['Node.js', 'Express', 'API', 'خادم'],
    readTime: 10,
    views: 756,
    likes: 45,
    createdAt: '2024-06-10',
    updatedAt: '2024-06-12',
    isPopular: false
  },
  {
    id: '5',
    title: 'أمان التطبيقات: دليل شامل للمطورين',
    description: 'أهمية أمان التطبيقات وكيفية حماية تطبيقاتك من الثغرات الأمنية الشائعة',
    content: 'أمان التطبيقات موضوع بالغ الأهمية في عصرنا الحالي. سنتعرف على أهم التهديدات وكيفية الحماية منها...',
    author: {
      name: 'عمر الشامي',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=400&h=400&fit=crop&crop=face',
      bio: 'خبير أمن المعلومات ومتخصص في أمان التطبيقات',
    },
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop',
    category: 'أمن المعلومات',
    tags: ['أمان', 'حماية', 'تطبيقات', 'أمن المعلومات'],
    readTime: 18,
    views: 923,
    likes: 78,
    createdAt: '2024-05-25',
    updatedAt: '2024-05-30',
    isPopular: true
  },
  {
    id: '6',
    title: 'تطوير تطبيقات الجوال باستخدام React Native',
    description: 'دليل مفصل لتطوير تطبيقات الجوال عبر المنصات باستخدام React Native',
    content: 'React Native يتيح لنا تطوير تطبيقات جوال لنظامي iOS و Android بكود واحد. سنتعلم الأساسيات والمفاهيم المتقدمة...',
    author: {
      name: 'ليلى محمود',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face',
      bio: 'مطورة تطبيقات جوال متخصصة في React Native و Flutter',
    },
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop',
    category: 'تطوير الجوال',
    tags: ['React Native', 'تطبيقات جوال', 'iOS', 'Android'],
    readTime: 14,
    views: 1340,
    likes: 156,
    createdAt: '2024-05-18',
    updatedAt: '2024-05-22',
    isPopular: true
  }
];