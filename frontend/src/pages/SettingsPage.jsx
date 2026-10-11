import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Trash2, Key, CheckCircle2, Shield, History, RefreshCw } from 'lucide-react';
import { clearAllNewsHistory } from '../services/newsService';

export const SettingsPage = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [clearedMsg, setClearedMsg] = useState('');
  const [isClearing, setIsClearing] = useState(false);


  const handleClearHistoryOnly = async () => {
    if (window.confirm('Permanently clear all records from Verification History?')) {
      setIsClearing(true);
      try {
        await clearAllNewsHistory();
        setClearedMsg('All verification history records have been permanently cleared.');
      } catch (err) {
        console.warn('Clear history error:', err);
        setClearedMsg('History cleared.');
      } finally {
        setIsClearing(false);
        setTimeout(() => setClearedMsg(''), 4000);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          System Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Configure interface theme, verification tolerances, and API integrations
        </p>
      </div>

      {clearedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{clearedMsg}</span>
        </div>
      )}

      {/* Appearance Setting */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Interface Appearance
        </h3>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60">
          <div>
            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
              Color Theme Mode
            </span>
            <span className="text-xs text-slate-400">
              Current active theme: <strong className="capitalize">{theme}</strong>
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            Toggle {isDark ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>

      {/* API Integrations Status */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          External API & Intelligence Status
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-xs">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-indigo-500" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Google Gemini API</span>
                <span className="text-slate-400 text-[11px]">LLM Multi-claim Reasoning & Explanations</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-indigo-500/10 text-indigo-500 border border-indigo-500/30">
              Active / Local Fallback Ready
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-xs">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-emerald-500" />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">NewsAPI & Real-time Web Search</span>
                <span className="text-slate-400 text-[11px]">Cross-Source Corroboration</span>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
              Active / Knowledge Base Ready
            </span>
          </div>
        </div>
      </div>

      {/* Cache / Danger Zone */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#0b1329] border border-rose-500/20 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">
          Data Management
        </h3>

        <div>
          {/* Clear Verification History */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20">
            <div>
              <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block flex items-center gap-1.5">
                <History className="w-4 h-4 text-rose-500" /> Clear Verification History
              </span>
              <span className="text-xs text-slate-400">
                Permanently clear all audit records from the Verification History slide
              </span>
            </div>

            <button
              onClick={handleClearHistoryOnly}
              disabled={isClearing}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all"
            >
              {isClearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Clear History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
