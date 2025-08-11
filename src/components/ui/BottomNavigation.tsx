import React, { useMemo, useCallback } from 'react';
import { FiHome, FiBookOpen, FiFileText, FiBriefcase, FiLayers, FiMail, FiMenu, FiUser, FiSun, FiMoon, FiLogOut, FiBookmark } from 'react-icons/fi';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { toggleTheme } from '@/store/slices/themeSlice';
import useAuth from '@/hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSavedArticles } from '@/hooks/useSavedArticles';

const navItems = [
  { label: 'الرئيسية', href: '/', icon: <FiHome className="h-5 w-5 mb-0.5" /> },
  { label: 'الدورات', href: '/courses', icon: <FiBookOpen className="h-5 w-5 mb-0.5" /> },
  { label: 'المقالات', href: '/articles', icon: <FiFileText className="h-5 w-5 mb-0.5" /> },
  { label: 'الخدمات', href: '/services', icon: <FiBriefcase className="h-5 w-5 mb-0.5" /> },
  { label: 'أعمالنا', href: '/portfolio', icon: <FiLayers className="h-5 w-5 mb-0.5" /> },
  { label: 'ابدأ مشروعك', href: '/contact', icon: <FiMail className="h-5 w-5 mb-0.5" /> },
];

const mainItems = navItems.slice(0, 3);
const moreItems = navItems.slice(3);

const BottomNavigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout: userLogout, user, isAuthenticated } = useAuth();
  const { savedCount } = useSavedArticles();

  // تحسين عرض حالة المستخدم - استخدام useMemo لتجنب إعادة الحساب
  const shouldShowUser = useMemo(() => {
    return isAuthenticated && user && user.name;
  }, [isAuthenticated, user]);

  const handleThemeToggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

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

  const isActive = useCallback((href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 border-t shadow z-50 flex justify-around py-0.5 md:hidden">
      {mainItems.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`relative flex flex-col items-center text-[11px] font-bold px-1.5 py-0.5 gap-0.5 rounded-lg transition-all
              ${active ? 'text-blue-600 dark:text-blue-400' : 'text-primary'}
              hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/20`}
          >
            <span className={`transition-all ${active ? 'scale-110' : 'opacity-80'}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {React.cloneElement(item.icon, {
                className: `h-5 w-5 mb-0.5 transition-all ${active ? 'text-blue-600 dark:text-blue-400 drop-shadow-glow' : 'text-primary'}`
              })}
            </span>
            {item.label}
            {active && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-b-xl bg-gradient-to-t from-blue-500/80 to-blue-400/0 animate-bounce-up shadow-lg" />
            )}
          </Link>
        );
      })}
      {moreItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center text-[11px] font-bold text-primary px-1.5 py-0.5 gap-0.5 rounded-lg transition-all hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/20 focus:outline-none">
              <FiMenu className="h-5 w-5 mb-0.5" />المزيد
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="center" className="mb-2 min-w-[7rem] p-1 rounded-lg text-xs">
            {moreItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link to={item.href} className="flex items-center gap-1 w-full px-2 py-1 rounded hover:bg-primary/10">
                  {item.icon}
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex flex-col items-center text-[11px] font-bold text-primary px-1.5 py-0.5 gap-0.5 rounded-lg transition-all hover:bg-primary/10 focus:bg-primary/10 active:bg-primary/20 focus:outline-none">
            <span className="flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 w-5 h-5 overflow-hidden mb-0.5">
              {user && (user.profile_photo_path || user.profile_photo_url) ? (
                <img
                  src={user.profile_photo_url || user.profile_photo_path}
                  alt={user.name || 'مستخدم'}
                  className="w-[22px] h-[22px] rounded-full object-cover"
                />
              ) : (
                <FiUser className="h-5 w-5 text-white" />
              )}
            </span>
            {shouldShowUser ? (
              <span className="max-w-[48px] truncate font-semibold text-[10px] text-foreground">{user?.name}</span>
            ) : (
              'الحساب'
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center" className="mb-2 min-w-[7rem] p-1 rounded-lg text-xs">
          <DropdownMenuItem onClick={handleThemeToggle} className="flex justify-between items-center gap-2 hover:bg-purple-50/80 hover:text-purple-700 focus:bg-purple-100/80 focus:text-purple-800 transition-all">
            {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
          </DropdownMenuItem>
          {shouldShowUser ? (
            <>
              <DropdownMenuItem asChild className="flex justify-between items-center gap-2 hover:bg-purple-50/80 hover:text-purple-700 focus:bg-purple-100/80 focus:text-purple-800 transition-all">
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
                    <span>المحفوظات</span>
                    <div className="flex items-center gap-2">
                      {savedCount > 0 && (
                        <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                          {savedCount}
                        </span>
                      )}
                      <FiBookmark className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex justify-between items-center gap-2 hover:bg-purple-50/80 hover:text-purple-700 focus:bg-purple-100/80 focus:text-purple-800 transition-all">
                تسجيل الخروج
                <FiLogOut className="h-4 w-4" />
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild className="hover:bg-blue-50/80 hover:text-blue-700 focus:bg-blue-100/80 focus:text-blue-800 transition-all rounded">
                <Link to="/login">تسجيل الدخول</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-blue-50/80 hover:text-blue-700 focus:bg-blue-100/80 focus:text-blue-800 transition-all rounded">
                <Link to="/register">إنشاء حساب</Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
};
export default BottomNavigation; 