import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, ExternalLink, Calendar, CheckCircle2, XCircle } from 'lucide-react';

export const EvidencePanel = ({ supporting = [], contradicting = [] }) => {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="space-y-4">
      {/* Evidence Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Sources ({supporting.length + contradicting.length})
        </button>
        <button
          onClick={() => setActiveTab('supporting')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'supporting'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-emerald-500'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Supporting ({supporting.length})
        </button>
        <button
          onClick={() => setActiveTab('contradicting')}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'contradicting'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-rose-500'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Contradicting ({contradicting.length})
        </button>
      </div>

      {/* Supporting Evidence List */}
      {(activeTab === 'all' || activeTab === 'supporting') && supporting.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Supporting Evidence & Cross-Reports
          </div>
          {supporting.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                  {item.title || item.source}
                </span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "{item.snippet || 'Corroborating statements verified across institutional databases.'}"
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {item.source}
                </span>
                {item.publishedDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.publishedDate}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contradicting Evidence List */}
      {(activeTab === 'all' || activeTab === 'contradicting') && contradicting.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            Contradicting Evidence & Debunking Archives
          </div>
          {contradicting.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-500/5 dark:bg-rose-950/20 space-y-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white">
                  {item.title || item.source}
                </span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rose-600 dark:text-rose-400 hover:underline flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "{item.snippet || 'Official rebuttal or factual counter-evidence documented by primary monitors.'}"
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="font-semibold text-rose-700 dark:text-rose-300">
                  {item.source}
                </span>
                {item.publishedDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.publishedDate}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {supporting.length === 0 && contradicting.length === 0 && (
        <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          No external news articles matched for direct corroboration.
        </div>
      )}
    </div>
  );
};

export default EvidencePanel;
