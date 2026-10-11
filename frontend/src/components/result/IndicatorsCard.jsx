import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const IndicatorsCard = ({ indicators = [] }) => {
  if (!indicators || indicators.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
        <span>No malicious linguistic anomalies or manipulative urgency patterns detected.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
        <AlertTriangle className="w-4 h-4" />
        Detected Suspicious Signals & Stylistic Flags
      </div>
      <div className="space-y-1.5">
        {indicators.map((ind, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200"
          >
            <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>{ind}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 italic mt-1">
        Note: Stylistic indicators serve as flags for investigation, not sole automatic proof of falsehood.
      </p>
    </div>
  );
};

export default IndicatorsCard;
