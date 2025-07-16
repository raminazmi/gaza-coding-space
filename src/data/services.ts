export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  price: {
    starting: number;
    currency: string;
  };
  duration: string;
  category: string;
  isPopular?: boolean;
}

export const services: Service[] = [
  {
    id: '1',
    title: 'تطوير مواقع الويب',
    description: 'تطوير مواقع ويب متجاوبة وعصرية باستخدام أحدث التقنيات',
    features: [
        'تصميم متجاوب مع جميع الأجهزة',
        'تحسين محركات البحث SEO',
        'أمان عالي المستوى',
        'سرعة تحميل فائقة',
      'لوحة إدارة سهلة الاستخدام',
      ],
    icon: 'layout-dashboard',
    price: {
      starting: 500,
      currency: 'USD',
    },
    duration: '2-4 أسابيع',
    category: 'تطوير',
    isPopular: true,
  },
  {
    id: '2',
    title: 'تطوير تطبيقات الهاتف',
    description: 'تطوير تطبيقات الهاتف الذكي لنظامي iOS و Android',
    features: [
        'تطبيقات أصلية وهجينة',
        'تصميم UI/UX احترافي',
        'ربط مع قواعد البيانات',
        'نشر في المتاجر الرسمية',
      'دعم فني مستمر',
      ],
    icon: 'user',
    price: {
      starting: 800,
      currency: 'USD',
    },
    duration: '4-8 أسابيع',
    category: 'تطوير',
    isPopular: false,
  },
  {
    id: '3',
    title: 'استشارات تقنية',
    description: 'استشارات تقنية متخصصة لمساعدتك في اتخاذ القرارات الصحيحة',
    features: [
        'تحليل المتطلبات التقنية',
        'اختيار التقنيات المناسبة',
        'وضع خطة تطوير مفصلة',
        'مراجعة الكود والأمان',
      'تدريب الفريق التقني',
      ],
    icon: 'settings',
    price: {
      starting: 100,
      currency: 'USD',
    },
    duration: '1-2 أسابيع',
    category: 'استشارات',
    isPopular: false,
  },
];