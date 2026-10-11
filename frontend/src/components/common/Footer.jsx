import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#040814] py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500 dark:text-slate-400 mb-14 lg:mb-0">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & SDG Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-500" />
            <span className="font-bold text-slate-700 dark:text-slate-200">
              TruthLens AI
            </span>
          </div>
          <span className="hidden sm:inline">|</span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
            SDG 16: Peace & Justice
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            SDG 4: Quality Education
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          <Link to="/models" className="hover:text-sky-500 transition-colors">
            Model Architecture
          </Link>
          <Link to="/how-it-works" className="hover:text-sky-500 transition-colors">
            Methodology
          </Link>
          <Link to="/dashboard" className="hover:text-sky-500 transition-colors">
            Dashboard
          </Link>
          <Link to="/settings" className="hover:text-sky-500 transition-colors">
            Settings
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-center md:text-right">
          <p>© {new Date().getFullYear()} TruthLens AI. Explainable Misinformation Analysis and Verification Platform.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
