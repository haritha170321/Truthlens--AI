import React from 'react';

export const DemoBadge = () => {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm">
      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping"></span>
      DEMO DATA
    </span>
  );
};

export default DemoBadge;
