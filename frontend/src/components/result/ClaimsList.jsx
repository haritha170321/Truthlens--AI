import React from 'react';
import { CheckCircle2, XCircle, HelpCircle, AlertCircle, Sparkles } from 'lucide-react';

export const ClaimsList = ({ claims = [] }) => {
  if (!claims || claims.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400 text-center">
        No discrete verifiable claims extracted.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Supported':
        return {
          icon: CheckCircle2,
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          label: 'Supported',
        };
      case 'Contradicted':
        return {
          icon: XCircle,
          color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30',
          label: 'Contradicted',
        };
      case 'Unsupported':
        return {
          icon: AlertCircle,
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          label: 'Unsupported',
        };
      default:
        return {
          icon: HelpCircle,
          color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
          label: 'Unverified',
        };
    }
  };

  return (
    <div className="space-y-3">
      {claims.map((claimObj, idx) => {
        const statusMeta = getStatusBadge(claimObj.status);
        const Icon = statusMeta.icon;

        return (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Claim #{idx + 1} • {claimObj.type || 'Factual Assertion'}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusMeta.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {statusMeta.label}
              </span>
            </div>

            <p className="text-xs md:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed mb-2">
              "{claimObj.claim}"
            </p>

            {claimObj.evidence && (
              <div className="text-[11px] md:text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-[#060d1f] p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Verification Rationale:
                </span>
                {claimObj.evidence}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ClaimsList;
