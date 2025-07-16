// Export all data types and arrays
export * from './courses';
export * from './articles';
export * from './services';
export * from './portfolio';

// Site configuration
export const siteConfig = {
  name: 'غزة كودنج سبيس',
  description: 'منصة تعليمية رائدة في تعليم البرمجة وتطوير التطبيقات للطلاب في غزة وفلسطين',
  keywords: ['تعلم البرمجة', 'دورات البرمجة', 'تطوير التطبيقات', 'غزة', 'فلسطين', 'تعليم تقني'],
  contact: {
    email: 'info@gazacodingspace.com',
    phone: '+970 59 123 4567',
    address: 'غزة، فلسطين',
  },
  social: {
    facebook: 'https://facebook.com/gazacodingspace',
    twitter: 'https://twitter.com/gazacodingspace',
    instagram: 'https://instagram.com/gazacodingspace',
    linkedin: 'https://linkedin.com/company/gazacodingspace',
    github: 'https://github.com/gazacodingspace',
    youtube: 'https://youtube.com/@gazacodingspace',
  },
};

// Navigation items
export const navigationItems = [
  {
    key: 'home',
    label: 'الرئيسية',
    href: '/',
  },
  {
    key: 'courses',
    label: 'الدورات',
    href: '/courses',
  },
  {
    key: 'articles',
    label: 'المقالات العلمية',
    href: '/articles',
  },
  {
    key: 'services',
    label: 'الخدمات',
    href: '/services',
  },
  {
    key: 'portfolio',
    label: 'أعمالنا',
    href: '/portfolio',
  },
  {
    key: 'contact',
    label: 'تواصل معنا',
    href: '/contact',
  },
];