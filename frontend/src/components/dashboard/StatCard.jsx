import React from 'react';

export const StatCard = ({ title, value, change, subtitle, icon: Icon, color = 'indigo' }) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/20',
    },
    emerald: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
    },
    rose: {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20',
    },
    amber: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
    },
    blue: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
    },
  };

  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} ${scheme.text} border ${scheme.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {change && (
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatCard;
