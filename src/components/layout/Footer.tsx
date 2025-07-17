import React, { useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Footer = () => {
  const [expandedSections, setExpandedSections] = useState({
    quickLinks: false,
    socialMedia: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <footer className="bg-white/90 dark:bg-gray-900/90 border-t pt-10 pb-6 text-gray-700 dark:text-gray-200 max-md:mb-12" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Mobile View - Accordion Sections */}
        <div className="md:hidden flex flex-col gap-6">
          {/* Logo Section */}
          <div className="flex flex-col items-center gap-3 mb-4">
            <a href="/" className="flex items-center gap-2 mb-2">
              <img src="/favicon.ico" alt="شعار TEBU SOFT" className="w-10 h-10 rounded-lg shadow" />
              <span className="font-extrabold text-xl text-blue-700 dark:text-blue-300">TEBU SOFT</span>
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs text-center leading-relaxed">
              منصة تعليمية متخصصة في البرمجة والتقنية، تقدم كورسات وورش عمل عالية الجودة بإشراف نخبة من المدربين العرب.
            </p>
          </div>

          {/* Quick Links Accordion */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              className="w-full flex justify-between items-center px-4 py-3 bg-blue-50 dark:bg-gray-800 font-bold text-blue-700 dark:text-blue-300"
              onClick={() => toggleSection('quickLinks')}
            >
              <span>روابط سريعة</span>
              {expandedSections.quickLinks ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${expandedSections.quickLinks ? 'max-h-96' : 'max-h-0'
                }`}
            >
              <ul className="grid grid-cols-2 gap-3 p-4">
                {[
                  { href: '/', label: 'الرئيسية' },
                  { href: '/courses', label: 'الدورات' },
                  { href: '/articles', label: 'المقالات' },
                  { href: '/services', label: 'الخدمات' },
                  { href: '/portfolio', label: 'أعمالنا' },
                  { href: '/contact', label: 'تواصل معنا' },
                ].map(link => (
                  <li key={link.href} className="py-1">
                    <a
                      href={link.href}
                      className="relative hover:text-blue-600 transition-colors after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full after:rounded"
                      style={{ paddingBottom: 2 }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Media Accordion */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              className="w-full flex justify-between items-center px-4 py-3 bg-blue-50 dark:bg-gray-800 font-bold text-blue-700 dark:text-blue-300"
              onClick={() => toggleSection('socialMedia')}
            >
              <span>تابعنا على</span>
              {expandedSections.socialMedia ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            <div
              className={`transition-all duration-300 overflow-hidden ${expandedSections.socialMedia ? 'max-h-96' : 'max-h-0'
                }`}
            >
              <div className="flex justify-center gap-4 p-4 flex-wrap">
                {[
                  { href: '#', icon: <FaFacebookF className="h-5 w-5" />, label: 'فيسبوك', color: 'hover:bg-blue-600' },
                  { href: '#', icon: <FaTwitter className="h-5 w-5" />, label: 'تويتر', color: 'hover:bg-blue-400' },
                  { href: '#', icon: <FaInstagram className="h-5 w-5" />, label: 'انستجرام', color: 'hover:bg-pink-500' },
                  { href: '#', icon: <FaLinkedinIn className="h-5 w-5" />, label: 'لينكدإن', color: 'hover:bg-blue-800' },
                  { href: '#', icon: <FaYoutube className="h-5 w-5" />, label: 'يوتيوب', color: 'hover:bg-red-600' },
                ].map(social => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`rounded-full bg-blue-50 dark:bg-gray-800 p-3 ${social.color} hover:text-white dark:hover:bg-opacity-90 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 duration-200`}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener"
                    style={{ transition: 'transform 0.2s' }}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex flex-col gap-10 md:gap-0 md:flex-row md:justify-between md:items-start">
          {/* لوجو ووصف */}
          <div className="flex-1 flex flex-col items-center md:items-start mb-8 md:mb-0 gap-3">
            <a href="/" className="flex items-center gap-2 mb-2">
              <img src="/favicon.ico" alt="شعار TEBU SOFT" className="w-10 h-10 rounded-lg shadow" />
              <span className="font-extrabold text-xl text-blue-700 dark:text-blue-300">TEBU SOFT</span>
            </a>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs text-center md:text-right leading-relaxed">
              منصة تعليمية متخصصة في البرمجة والتقنية، تقدم كورسات وورش عمل عالية الجودة بإشراف نخبة من المدربين العرب.
            </p>
          </div>

          {/* فاصل */}
          <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 mx-6" />

          {/* روابط سريعة */}
          <div className="flex-1 mb-8 md:mb-0 flex flex-col items-center md:items-start gap-4">
            <h3 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-300">روابط سريعة</h3>
            <ul className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6">
              {[
                { href: '/', label: 'الرئيسية' },
                { href: '/courses', label: 'الدورات' },
                { href: '/articles', label: 'المقالات' },
                { href: '/services', label: 'الخدمات' },
                { href: '/portfolio', label: 'أعمالنا' },
                { href: '/contact', label: 'تواصل معنا' },
              ].map(link => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="relative hover:text-blue-600 transition-colors after:absolute after:-bottom-1 after:right-0 after:w-0 after:h-0.5 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full after:rounded"
                    style={{ paddingBottom: 2 }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* فاصل */}
          <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-700 mx-6" />

          {/* تابعنا على */}
          <div className="flex-1 flex flex-col items-center md:items-start gap-4 mb-8 md:mb-0">
            <h3 className="font-bold text-lg mb-2 text-blue-700 dark:text-blue-300">تابعنا على</h3>
            <div className="flex gap-3 md:gap-4">
              {[
                { href: '#', icon: <FaFacebookF className="h-5 w-5" />, label: 'فيسبوك', color: 'hover:bg-blue-600' },
                { href: '#', icon: <FaTwitter className="h-5 w-5" />, label: 'تويتر', color: 'hover:bg-blue-400' },
                { href: '#', icon: <FaInstagram className="h-5 w-5" />, label: 'انستجرام', color: 'hover:bg-pink-500' },
                { href: '#', icon: <FaLinkedinIn className="h-5 w-5" />, label: 'لينكدإن', color: 'hover:bg-blue-800' },
                { href: '#', icon: <FaYoutube className="h-5 w-5" />, label: 'يوتيوب', color: 'hover:bg-red-600' },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  className={`rounded-full bg-blue-50 dark:bg-gray-800 p-2 ${social.color} hover:text-white dark:hover:bg-opacity-90 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 active:scale-95 duration-200`}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener"
                  style={{ transition: 'transform 0.2s' }}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* سياسة الخصوصية والشروط والحقوق - مشتركة */}
        <div className="w-full bg-gray-50 dark:bg-gray-800/60 rounded-lg py-4 px-6 mt-10">
          <div className="flex flex-col md:flex-row justify-center text-center md:justify-between   items-center gap-2">
            <div className="flex gap-4 text-sm">
              <a href="#" className="hover:underline hover:text-blue-600 transition-colors">سياسة الخصوصية</a>
              <a href="#" className="hover:underline hover:text-blue-600 transition-colors">الشروط والأحكام</a>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} TEBU SOFT. جميع الحقوق محفوظة.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;