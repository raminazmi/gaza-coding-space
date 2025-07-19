import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { toggleTheme } from '@/store/slices/themeSlice';
import { FiUser, FiMoon, FiSun, FiCode, FiMessageCircle } from 'react-icons/fi';
import { setUser, logout, fetchUser } from '@/store/slices/userSlice';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { apiBaseUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import React from 'react';

const Header = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const user = useAppSelector((state) => state.user.user);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  const breadcrumbItems = React.useMemo(() => {
    if (pathnames[0] === 'order-service') {
      return [
        { to: '/', label: 'الرئيسية' },
        { to: '/services', label: 'الخدمات' },
        { to: location.pathname, label: localStorage.getItem('breadcrumb_service_name') || 'طلب خدمة' }
      ];
    }
    return [
      { to: '/', label: 'الرئيسية' },
      ...pathnames.map((segment, idx) => {
        const to = '/' + pathnames.slice(0, idx + 1).join('/');
        let label = decodeURIComponent(segment);
        if (pathnames[0] === 'courses' && idx === 1) {
          label = localStorage.getItem('breadcrumb_course_name') || label;
        }
        if (pathnames[0] === 'courses' && pathnames[2] === 'lecture' && idx === 3) {
          label = localStorage.getItem('breadcrumb_lecture_name') || label;
        }
        if (pathnames[0] === 'articles' && idx === 1) {
          label = localStorage.getItem('breadcrumb_article_title') || label;
        }
        if (pathnames[0] === 'order-service' && idx === 1) {
          label = localStorage.getItem('breadcrumb_service_name') || label;
        }
        if (label === 'courses') label = 'الدورات';
        if (label === 'articles') label = 'المقالات';
        if (label === 'services') label = 'الخدمات';
        if (label === 'portfolio') label = 'أعمالنا';
        if (label === 'contact') label = 'تواصل معنا';
        if (label === 'chat') label = 'الدردشة';
        if (label === 'lecture') label = 'محاضرة';
        if (label === 'order-service') label = 'طلب خدمة';
        return { to, label };
      })
    ];
  }, [location.pathname, pathnames]);
  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/courses', label: 'الدورات' },
    { to: '/articles', label: 'المقالات' },
    { to: '/services', label: 'الخدمات' },
    { to: '/portfolio', label: 'أعمالنا' },
    { to: '/contact', label: 'تواصل معنا' },
  ];

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchUser());
    }
  }, [dispatch]);

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-gray-900/40 transition-all overflow-hidden" dir="rtl">
        <div className="relative z-10">
          <div className="container flex h-16 items-center justify-between px-2 md:px-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 flex-row mx-auto md:mx-0">
              <span className="font-extrabold text-lg md:text-xl tracking-tight drop-shadow-sm">
                <span className="text-[#041665] dark:text-blue-200">TEBU</span>
                <span className="text-blue-400/40 dark:text-purple-300/60 mx-1">SOFT</span>
              </span>
              <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 shadow-md ring-2 ring-blue-400/40 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 transition-all animate-glow">
                <img src="/assests/tebusoft.jpg" alt="TEBU SOFT" className="rounded-lg object-cover h-8 w-8 md:h-10 md:w-10 drop-shadow-glow" />
              </span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4 flex-row-reverse">
              <ul className="flex flex-row gap-2 relative">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.to || (link.to !== '/' && location.pathname.startsWith(link.to));
                  return (
                    <li key={link.to} className="relative">
                      <Link
                        to={link.to}
                        className={`relative px-2 md:px-3 py-1.5 text-base md:text-lg font-medium transition-colors duration-200
                        ${isActive ? 'text-blue-700 dark:text-blue-200 bg-blue-100/80 dark:bg-blue-900/40 shadow-md font-extrabold rounded scale-105 ring-2 ring-blue-200/60 dark:ring-blue-900/40' : 'text-gray-800 dark:text-gray-100 hover:text-blue-500 dark:hover:text-blue-300'}
                      `}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 flex-row">
              {/* Chat Icon */}
              <Link
                to="/chat"
                className={`relative hidden md:flex items-center justify-center rounded-full p-2 transition-colors hover:bg-blue-100/60 dark:hover:bg-blue-900/40 ${location.pathname.startsWith('/chat') ? 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200' : 'text-blue-700 dark:text-gray-100'}`}
                title="الدردشة"
              >
                <FiMessageCircle className="h-6 w-6" />
                {/* <Badge className="absolute -top-1 -right-1 bg-red-500 text-white">2</Badge> */}
              </Link>
              {/* User Menu + Desktop Search */}
              <div className="hidden md:flex items-center gap-2 flex-row-reverse">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      {isAuthenticated && user ? (
                        <div className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 font-semibold text-base rounded-xl px-1.5 py-1 shadow border border-blue-100 dark:border-blue-900 max-w-[160px] truncate transition-colors">
                          <span className="flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 w-7 h-7">
                            <FiUser className="h-5 w-5 text-white" />
                          </span>
                          {user.name ? user.name : 'مستخدم'}
                        </div>
                      )
                        :
                        <span className="flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 w-9 h-9">
                          <FiUser className="h-5 w-5 text-white" />
                        </span>
                      }
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={handleThemeToggle} className="flex justify-between items-center gap-2 hover:bg-purple-50/80 hover:text-purple-700 focus:bg-purple-100/80 focus:text-purple-800 transition-all">
                      {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                      {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
                    </DropdownMenuItem>
                    {isAuthenticated && user ? (
                      <>
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 hover:bg-blue-50/80 hover:text-blue-700 focus:bg-blue-100/80 focus:text-blue-800 transition-all">
                          تسجيل الخروج
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem asChild className="hover:bg-blue-50/80 hover:text-blue-700 focus:bg-blue-100/80 focus:text-blue-800 transition-all">
                          <Link to="/login">تسجيل الدخول</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="hover:bg-blue-50/80 hover:text-blue-700 focus:bg-blue-100/80 focus:text-blue-800 transition-all">
                          <Link to="/register">إنشاء حساب</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Breadcrumb */}
      {location.pathname !== '/' && (
        <div className="w-fit flex justify-start pt-4 pb-3 px-2 md:px-8">
          <div className="max-w-2xl w-full rounded-xl bg-gradient-to-l from-white/80 via-white/60 to-white/80 dark:from-gray-900/80 dark:via-gray-800/70 dark:to-gray-900/80 shadow-sm border border-gray-100 dark:border-gray-800 px-4 py-2 flex items-center gap-1 backdrop-blur-sm transition-all mx-2">
            <Breadcrumb>
              <BreadcrumbList className="text-[15px] md:text-base">
                {breadcrumbItems.map((item, idx) => (
                  <React.Fragment key={item.to}>
                    <BreadcrumbItem>
                      {idx === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage className="font-bold text-blue-700 dark:text-blue-200">{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.to} className="hover:text-blue-600 dark:hover:text-blue-300">{item.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {idx < breadcrumbItems.length - 1 && <BreadcrumbSeparator><span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm">/</span></BreadcrumbSeparator>}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;