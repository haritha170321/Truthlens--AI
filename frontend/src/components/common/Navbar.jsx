import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  Search,
  History,
  Bookmark,
  BarChart3,
  HelpCircle,
  Cpu,
  Globe,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const authNavLinks = [
    { label: t('navDashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('navVerify'), path: '/check', icon: Search },
    { label: t('navHistory'), path: '/history', icon: History },
    { label: t('navSaved'), path: '/saved', icon: Bookmark },
    { label: t('navAnalytics'), path: '/analytics', icon: BarChart3 },
    { label: t('navMethodology'), path: '/models', icon: Cpu },
  ];

  const publicNavLinks = [
    { label: t('navMethodology'), path: '/models', icon: Cpu },
    { label: 'How It Works', path: '/how-it-works', icon: HelpCircle },
  ];

  const navLinks = isAuthenticated ? authNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#060d1f]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & SDG Indicator */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg md:text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
                Truth<span className="text-sky-500 dark:text-sky-400">Lens</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-500 border border-sky-500/20">
                AI
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[9px] text-slate-500 dark:text-slate-400">
              <span className="text-sky-400 font-semibold">SDG 16</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">SDG 4</span>
              <span>•</span>
              <span>Explainable Verification</span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & Utilities */}
        <div className="flex items-center gap-2">
          {/* Multilingual Toggle: English / Tamil */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Language / மொழியை மாற்றுக"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className={language === 'ta' ? 'text-sky-400' : ''}>
              {language === 'en' ? 'EN | தமிழ்' : 'தமிழ் | EN'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs text-slate-800 dark:text-slate-200 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="font-medium max-w-[100px] truncate">{user?.name || 'Analyst'}</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
              >
                {t('navLogin')}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-sm transition-colors"
              >
                {t('navRegister')}
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060d1f] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive
                    ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
