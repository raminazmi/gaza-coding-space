import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/hooks';
import useAuth from '@/hooks/useAuth';
import { toggleTheme } from '@/store/slices/themeSlice';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { messaging, onMessage } from '../../firebase';
import { apiBaseUrl } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';
import { FiUser, FiMoon, FiSun, FiMessageCircle, FiBell, FiBookOpen, FiLogOut, FiBookmark } from 'react-icons/fi';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { useSavedArticles } from '@/hooks/useSavedArticles';

interface ExternalToast {
  action?: { label: string; onClick: () => void };
}

const Header = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const breadcrumbData = useAppSelector((state) => state.breadcrumb.data);
  const { authService, getToken, logout: userLogout, user, isAuthenticated } = useAuth();
  const { unreadMessages, markAllAsRead, setUnreadMessages } = useUnreadMessages();
  const { notifications, notifCount, notifLoading, markNotificationsAsRead } = useNotifications();
  const { savedCount } = useSavedArticles();
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(Boolean);
  const navigate = useNavigate();

  const shouldShowUser = useMemo(() => {
    return isAuthenticated && user && user.name;
  }, [isAuthenticated, user]);



  const breadcrumbItems = useMemo(() => {
    if (pathnames[0] === 'order-service') {
      return [
        { to: '/', label: 'الرئيسية' },
        { to: '/services', label: 'الخدمات' },
        { to: location.pathname, label: breadcrumbData.serviceName || 'طلب خدمة' }
      ];
    }
    return [
      { to: '/', label: 'الرئيسية' },
      ...pathnames.filter((segment, idx) => !(pathnames[0] === 'courses' && segment === 'lecture' && idx === 2))
        .map((segment, idx, filteredPathnames) => {
          const originalIdx = pathnames.indexOf(segment, idx > 0 ? pathnames.indexOf(filteredPathnames[idx - 1]) + 1 : 0);
          const to = '/' + pathnames.slice(0, originalIdx + 1).join('/');
          let label = decodeURIComponent(segment);
          if (pathnames[0] === 'courses' && originalIdx === 1) label = breadcrumbData.courseName || label;
          if (pathnames[0] === 'courses' && pathnames[2] === 'lecture' && originalIdx === 3) label = breadcrumbData.lectureName || label;
          if (pathnames[0] === 'articles' && originalIdx === 1) label = breadcrumbData.articleTitle || label;
          if (pathnames[0] === 'services' && originalIdx === 1) {
            label = breadcrumbData.serviceName || decodeURIComponent(segment);
          }
          if (pathnames[0] === 'order-service' && originalIdx === 1) label = breadcrumbData.serviceName || label;
          if (pathnames[0] === 'portfolio' && originalIdx === 1) label = breadcrumbData.portfolioTitle || label;
          if (label === 'courses') label = 'الدورات';
          if (label === 'my-courses') label = 'دوراتي';
          if (pathnames[0] === 'teacher' && originalIdx === 1) {
            label = breadcrumbData.teacherName || 'صفحة المدرب';
          }
          if (label === 'teacher') label = 'المدرب';
          if (label === 'profile') label = 'الملف الشخصي';
          if (label === 'notifications') label = 'الإشعارات';
          if (label === 'articles') label = 'المقالات';
          if (label === 'saved-articles') label = 'المقالات المحفوظة';
          if (label === 'services') label = 'الخدمات';
          if (label === 'portfolio') label = 'أعمالنا';
          if (label === 'contact') label = 'ابدأ مشروعك';
          if (label === 'chat') label = 'الدردشة';
          if (label === 'order-service') label = 'طلب خدمة';
          return { to, label };
        })
    ];
  }, [location.pathname, pathnames, breadcrumbData]);

  const navLinks = useMemo(() => [
    { to: '/', label: 'الرئيسية' },
    { to: '/courses', label: 'الدورات' },
    { to: '/articles', label: 'المقالات' },
    { to: '/services', label: 'الخدمات' },
    { to: '/portfolio', label: 'أعمالنا' },
    { to: '/contact', label: 'ابدأ مشروعك' },
  ], []);

  const handleThemeToggle = useCallback(() => dispatch(toggleTheme()), [dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      await userLogout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // في حالة فشل logout API، قم بتسجيل الخروج محلياً
      navigate('/');
    }
  }, [userLogout, navigate]);

  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'granted') {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received:', payload);
        toast(
          `${payload.notification?.title ? payload.notification.title + ': ' : ''}${payload.notification?.body || 'لديك رسالة جديدة'}`,
          {
            action: { label: 'عرض', onClick: () => navigate('/chat') },
          }
        );
        // تحديث عدد الرسائل غير المقروءة عند تلقي إشعار جديد
        setUnreadMessages(prev => prev + 1);
      });

      return () => unsubscribe && unsubscribe();
    }
  }, [isAuthenticated, navigate, setUnreadMessages]);

  const handleNotifOpen = async (open: boolean) => {
    setNotifOpen(open);
    if (open && isAuthenticated) {
      await markNotificationsAsRead();
    }
  };



  const handleChatClick = async () => {
    if (unreadMessages > 0) {
      await markAllAsRead();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl shadow-lg supports-[backdrop-filter]:bg-white/40 dark:supports-[backdrop-filter]:bg-gray-900/40 transition-all overflow-hidden" dir="rtl">
        <div className="relative z-10">
          <div className="container flex h-16 items-center justify-between px-2 md:px-6">
            <Link to="/" className="flex items-center gap-2 flex-row mx-0">
              <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 shadow-md ring-2 ring-blue-400/40 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 transition-all animate-glow">
                <img src="/assests/art_tebu.jpg" alt="TEBU SOFT" className="rounded-lg object-cover h-8 w-8 md:h-10 md:w-10 drop-shadow-glow" />
              </span>
              <span className="font-extrabold text-lg md:text-xl tracking-tight drop-shadow-sm">
                <span className="text-[#041665] dark:text-blue-200">ART</span>
                <span className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-glow">TEBU</span>
              </span>
            </Link>

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

            <div className="flex items-center gap-2 flex-row">
              <Link
                to="/chat"
                onClick={handleChatClick}
                className={`relative flex items-center justify-center rounded-full p-2 transition-colors hover:bg-blue-100/60 dark:hover:bg-blue-900/40 ${location.pathname.startsWith('/chat') ? 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200' : 'text-blue-700 dark:text-gray-100'}`}
                title="الدردشة"
              >
                <FiMessageCircle className="h-6 w-6" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">{unreadMessages}</span>
                )}
              </Link>
              <DropdownMenu open={notifOpen} onOpenChange={handleNotifOpen}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`relative rounded-full p-2 transition-colors hover:bg-blue-100/60 dark:hover:bg-blue-900/40 ${notifOpen ? 'bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200' : 'text-blue-700 dark:text-gray-100'}`}
                    title="الإشعارات"
                    onClick={() => handleNotifOpen(!notifOpen)}
                  >
                    <FiBell className="h-6 w-6" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold animate-pulse">{notifCount}</span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="center" className="w-80 max-w-xs p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 animate-fade-in">
                  <div className="font-bold text-base text-gray-800 dark:text-gray-100 mb-2">الإشعارات</div>
                  {notifLoading ? (
                    <div className="text-center py-4">جاري التحميل...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">لا توجد إشعارات</div>
                  ) : (
                    <ul className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                      {notifications.map((n) => (
                        <li key={n.id} className={`rounded-lg p-3 border ${n.read_at ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-blue-50/60 dark:bg-blue-900/40 border-blue-200 dark:border-blue-700'}`}>
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{n.type?.split('\\').pop() || 'إشعار جديد'}</span>
                            <div className="flex justify-between items-center gap-1">
                              <span className="text-xs text-gray-500 dark:text-gray-300">{new Date(n.created_at).toLocaleString('ar-EG')}</span>
                              <span className="text-end">
                                {!n.read_at && <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-500 text-white text-xs w-fit">غير مقروء</span>}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2 text-center">
                    <Link
                      to="/notifications"
                      className="text-blue-600 hover:underline font-bold"
                      onClick={() => handleNotifOpen(false)}
                    >
                      عرض المزيد
                    </Link>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="hidden md:flex items-center gap-2 flex-row-reverse">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-2 cursor-pointer">
                      {shouldShowUser ? (
                        <div className="flex items-center gap-2 cursor-pointer bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 font-semibold text-base rounded-xl px-1.5 py-1 shadow border border-blue-100 dark:border-blue-900 max-w-[160px] truncate transition-colors">
                          <span className="flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 w-7 h-7 overflow-hidden">
                            {user && (user.profile_photo_path || user.profile_photo_url) ? (
                              <img src={user.profile_photo_url || user.profile_photo_path} alt={user?.name || 'مستخدم'} className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <FiUser className="h-5 w-5 text-white" />
                            )}
                          </span>
                          {user?.name}
                        </div>
                      ) : (
                        <span className="flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 w-9 h-9">
                          <FiUser className="h-5 w-5 text-white" />
                        </span>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={handleThemeToggle} className="flex justify-between items-center gap-2 hover:bg-purple-50/80 hover:text-purple-700 focus:bg-purple-100/80 focus:text-purple-800 transition-all">
                      {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'} {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
                    </DropdownMenuItem>
                    {shouldShowUser ? (
                      <>
                        <DropdownMenuItem asChild className="flex justify-between items-center gap-2 hover:bg-blue-50/80 hover:text-blue-700 focus:bg-blue-100/80 focus:text-blue-800 transition-all">
                          <Link to="/profile">
                            الملف الشخصي
                            <FiUser className="h-4 w-4" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="flex justify-between items-center gap-2 hover:bg-purple-50/80 hover:text-purple-700 focus:bg-purple-100/80 focus:text-purple-800 transition-all">
                          <Link to="/my-courses">
                            دوراتي
                            <FiBookOpen className="h-4 w-4" />
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="flex justify-between items-center gap-2 hover:bg-green-50/80 hover:text-green-700 focus:bg-green-100/80 focus:text-green-800 transition-all">
                          <Link to="/saved-articles">
                            <div className="flex items-center justify-between w-full">
                              <span>المقالات المحفوظة</span>
                              <div className="flex items-center gap-2">
                                {savedCount > 0 && (
                                  <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {savedCount}
                                  </span>
                                )}
                                <FiBookmark className="h-4 w-4" />
                              </div>
                            </div>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="flex justify-between items-center gap-2 hover:bg-red-50/80 hover:text-red-700 focus:bg-red-100/80 focus:text-red-800 transition-all">
                          <span>تسجيل الخروج</span>
                          <FiLogOut className="h-4 w-4" />
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
      {location.pathname !== '/' && !location.pathname.startsWith('/chat') && (
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
                        <BreadcrumbLink to={item.to} className="hover:text-blue-600 dark:hover:text-blue-300">{item.label}</BreadcrumbLink>
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