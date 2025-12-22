import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, FolderOpen, Search, User, LayoutDashboard } from 'lucide-react';

interface MobileNavProps {
  isLoggedIn?: boolean;
}

const MobileNav: React.FC<MobileNavProps> = ({ isLoggedIn = false }) => {
  const location = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
              isActive
                ? 'text-indigo-600'
                : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-6 h-6 ${isActive ? 'fill-indigo-600' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                首页
              </span>
            </>
          )}
        </NavLink>

        {/* Knowledge */}
        <NavLink
          to="/knowledge"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
              isActive
                ? 'text-indigo-600'
                : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <BookOpen className={`w-6 h-6 ${isActive ? 'fill-indigo-600' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                知识
              </span>
            </>
          )}
        </NavLink>

        {/* Cases */}
        <NavLink
          to="/cases"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
              isActive
                ? 'text-indigo-600'
                : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FolderOpen className={`w-6 h-6 ${isActive ? 'fill-indigo-600' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                案例
              </span>
            </>
          )}
        </NavLink>

        {/* Search */}
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
              isActive
                ? 'text-indigo-600'
                : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Search className={`w-6 h-6 ${isActive ? 'fill-indigo-600' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                搜索
              </span>
            </>
          )}
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
              isActive
                ? 'text-indigo-600'
                : 'text-gray-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <User className={`w-6 h-6 ${isActive ? 'fill-indigo-600' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                我的
              </span>
            </>
          )}
        </NavLink>

        {/* Dashboard - Only show when logged in */}
        {isLoggedIn && (
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all flex-1 ${
                isActive || location.pathname.startsWith('/dashboard')
                  ? 'text-indigo-600'
                  : 'text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutDashboard className={`w-6 h-6 ${isActive || location.pathname.startsWith('/dashboard') ? 'fill-indigo-600' : ''}`} />
                <span className={`text-xs ${isActive || location.pathname.startsWith('/dashboard') ? 'font-semibold' : 'font-medium'}`}>
                  控制台
                </span>
              </>
            )}
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;
