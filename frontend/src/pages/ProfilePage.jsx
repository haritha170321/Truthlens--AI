import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Investigator Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Account credentials, role authorization, and research workspace details
        </p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        {/* User Banner */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-600/30">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {user?.name || 'User'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase">
                {user?.role || 'User'}
              </span>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified Investigator
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Workspace Type</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Academic AIML Research Node</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 block">Audit Access</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">Full Multi-Modal Verification Suite</span>
          </div>
        </div>

        {/* Quick links */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <Link
            to="/history"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            My Verification History
          </Link>
          <Link
            to="/saved"
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200"
          >
            Saved Bookmarks
          </Link>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold ml-auto transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
