import React from 'react';
import { FiHome, FiBookOpen, FiFileText, FiBriefcase, FiLayers, FiMail, FiMenu, FiUser, FiSun, FiMoon } from 'react-icons/fi';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useAppSelector, useAppDispatch } from '@/hooks';
import { toggleTheme } from '@/store/slices/themeSlice';
import { logout } from '@/store/slices/userSlice';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'الرئيسية', href: '/', icon: <FiHome className="h-5 w-5 mb-0.5" /> },
  { label: 'الدورات', href: '/courses', icon: <FiBookOpen className="h-5 w-5 mb-0.5" /> },
  { label: 'المقالات', href: '/articles', icon: <FiFileText className="h-5 w-5 mb-0.5" /> },
  { label: 'الخدمات', href: '/services', icon: <FiBriefcase className="h-5 w-5 mb-0.5" /> },
  { label: 'أعمالنا', href: '/portfolio', icon: <FiLayers className="h-5 w-5 mb-0.5" /> },
  { label: 'تواصل معنا', href: '/contact', icon: <FiMail className="h-5 w-5 mb-0.5" /> },
];

const mainItems = navItems.slice(0, 3);
const moreItems = navItems.slice(3);

const BottomNavigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);
  const user = useAppSelector((state) => state.user.user);
  const isAuthenticated = useAppSelector((state) => state.user.isAuthenticated);
  const location = useLocation();

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(logout());
    window.location.reload();
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

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
            {user && user.name ? (
              <span className="max-w-[48px] truncate font-semibold text-[10px] text-foreground">{user.name}</span>
            ) : (
              'الحساب'
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center" className="mb-2 min-w-[7rem] p-1 rounded-lg text-xs">
          <DropdownMenuItem onClick={handleThemeToggle} className="flex justify-between w-full items-center gap-1 hover:bg-purple-50/80 hover:text-purple-700 focus:bg-purple-100/80 focus:text-purple-800 transition-all rounded">
            {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            {theme === 'dark' ? <FiSun className="h-4 w-4" /> : <FiMoon className="h-4 w-4" />}
          </DropdownMenuItem>
          {isAuthenticated && user ? (
            <>
              <DropdownMenuItem asChild className="hover:bg-blue-50/80 hover:text-blue-700 focus:bg-blue-100/80 focus:text-blue-800 transition-all rounded">
                <Link to="/profile">الملف الشخصي</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-1 hover:bg-blue-50/80 hover:text-blue-700 focus:bg-blue-100/80 focus:text-blue-800 transition-all rounded">
                تسجيل الخروج
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