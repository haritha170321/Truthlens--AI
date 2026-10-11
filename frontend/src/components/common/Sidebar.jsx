import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Search,
  History,
  Bookmark,
  BarChart3,
  HelpCircle,
  Settings,
  ShieldAlert,
  Sliders,
} from 'lucide-react';

export const Sidebar = () => {
  const { isAuthenticated } = useAuth();

  // If user is not logged in / joined, do not render sidebar panel
  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Check News', path: '/check', icon: Search, badge: 'AI Engine' },
    { label: 'Verification History', path: '/history', icon: History },
    { label: 'Saved Articles', path: '/saved', icon: Bookmark },
    { label: 'Analytics & Insights', path: '/analytics', icon: BarChart3 },
    { label: 'How It Works', path: '/how-it-works', icon: HelpCircle },
    { label: 'System Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#060d1f] p-4 flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Group */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
          Investigation Suite
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs md:text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Mini Model Card */}
      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800/80">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900/60 border border-indigo-500/20">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
            <Sliders className="w-3.5 h-3.5" />
            Hybrid AI Pipeline Active
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Multi-modal scoring enabled: ML + LLM Reasoning + NewsAPI + Credibility Registry.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
