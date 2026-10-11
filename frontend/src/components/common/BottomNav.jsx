import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Search, History, BarChart3, User } from 'lucide-react';

export const BottomNav = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  const items = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'History', path: '/history', icon: History },
    { label: 'Check', path: '/check', icon: Search, isPrimary: true },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#060d1f]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {items.map((item) => {
        const Icon = item.icon;

        if (item.isPrimary) {
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative -top-4 flex flex-col items-center group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 border-4 border-white dark:border-[#060d1f] group-active:scale-95 transition-transform">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {item.label}
              </span>
            </NavLink>
          );
        }

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 min-w-[56px] rounded-lg transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};

export default BottomNav;
