export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  images: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  completedAt: string;
  client?: {
    name: string;
    industry: string;
  };
}

export const portfolio: PortfolioItem[] = [
  {
    id: '1',
    title: 'منصة التعلم الإلكتروني',
    description: 'منصة تعليمية شاملة تتيح للطلاب والمدرسين التفاعل وإدارة الدورات التدريبية بطريقة حديثة وفعالة',
    category: 'تطبيقات ويب',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Socket.io'],
    images: ['/placeholder.svg', '/placeholder.svg'],
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com/example',
    featured: true,
    completedAt: '2024-06-15',
    client: {
      name: 'معهد التقنية المتقدمة',
      industry: 'التعليم',
    },
  },
  {
    id: '2',
    title: 'تطبيق إدارة المشاريع',
    description: 'تطبيق ويب لإدارة المشاريع والمهام مع ميزات التعاون الجماعي والتتبع الزمني',
    category: 'أنظمة إدارة',
    technologies: ['Vue.js', 'Laravel', 'MySQL', 'Redis'],
    images: ['/placeholder.svg'],
    liveUrl: 'https://example2.com',
    featured: false,
    completedAt: '2024-05-20',
    client: {
      name: 'شركة التقنيات الحديثة',
      industry: 'التكنولوجيا',
    },
  },
  {
    id: '3',
    title: 'متجر إلكتروني متكامل',
    description: 'متجر إلكتروني متكامل مع نظام إدارة المخزون وبوابات الدفع المتعددة',
    category: 'التجارة الإلكترونية',
    technologies: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma'],
    images: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
    liveUrl: 'https://example3.com',
    featured: true,
    completedAt: '2024-04-10',
    client: {
      name: 'متجر الأزياء العصرية',
      industry: 'التجارة',
    },
  }
];