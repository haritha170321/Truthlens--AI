import React from 'react';
import { Globe, ShieldCheck, ShieldAlert, Lock, Unlock, CheckCircle2 } from 'lucide-react';

export const SourceCredibilityCard = ({ source = {} }) => {
  const {
    sourceName = 'Direct Submission',
    tier = 'Moderate Credibility',
    credibilityScore = 0.6,
    isHttps = true,
    domain = 'N/A',
    notes = 'Domain evaluated against known journalistic indices.',
  } = source;

  const scorePct = Math.round((credibilityScore || 0.6) * 100);

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
            {sourceName}
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          {tier}
        </span>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Domain Credibility Index</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">{scorePct}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              scorePct >= 75 ? 'bg-emerald-500' : scorePct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${scorePct}%` }}
          ></div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          {isHttps ? <Lock className="w-3 h-3 text-emerald-500" /> : <Unlock className="w-3 h-3 text-rose-500" />}
          {isHttps ? 'HTTPS Secure' : 'HTTP Insecure'}
        </span>
        {domain && domain !== 'N/A' && (
          <span className="px-2 py-0.5 rounded bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
            Domain: {domain}
          </span>
        )}
      </div>

      {notes && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          {notes}
        </p>
      )}
    </div>
  );
};

export default SourceCredibilityCard;
