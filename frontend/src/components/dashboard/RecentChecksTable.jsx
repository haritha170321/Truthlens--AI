import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Calendar, FileText, ArrowRight, Shield } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import DemoBadge from '../common/DemoBadge';

export const RecentChecksTable = ({ items = [] }) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200 dark:border-slate-800">
        <Shield className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="font-semibold">No recent checks found.</p>
        <p className="text-xs mt-1">Submit an article or URL in the Check News tab to begin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Desktop View Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0b1329] shadow-sm">
        <table className="w-full text-left text-xs md:text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-4">Headline / Story</th>
              <th className="py-3 px-4">Verdict</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Input Type</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {items.map((item) => {
              const id = item._id || item.id;
              return (
                <tr key={id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 max-w-xs lg:max-w-md">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {item.headline || item.title || 'Untitled News Item'}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span>{item.publisher || 'Direct Submission'}</span>
                      {item.isDemoData && <DemoBadge />}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.outcomeCategory || item.prediction} size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{ width: `${item.confidenceScore || item.finalConfidence || 75}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-xs">{item.confidenceScore || item.finalConfidence || 75}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.inputType || 'TEXT'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-xs">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/result/${id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      Audit <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Responsive Cards */}
      <div className="md:hidden space-y-3">
        {items.map((item) => {
          const id = item._id || item.id;
          return (
            <div
              key={id}
              className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <StatusBadge status={item.prediction} size="sm" />
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {item.inputType || 'TEXT'}
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                {item.headline || item.title || 'Untitled News Item'}
              </h4>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Today'}</span>
                </div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  {item.finalConfidence || 75}% Confidence
                </div>
              </div>

              <Link
                to={`/result/${id}`}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
              >
                View Explainable Result <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentChecksTable;
