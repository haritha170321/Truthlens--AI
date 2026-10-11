import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404 - Page Not Found</h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md">
        The page or investigation you are seeking does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
