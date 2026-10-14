import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Calendar,
  CheckCircle2,
  XCircle,
  Info,
  Globe,
  AlertCircle,
  Search,
} from 'lucide-react';

export const EvidencePanel = ({
  supporting = [],
  contradicting = [],
  context = [],
  searchMetadata = null,
}) => {
  const [activeTab, setActiveTab] = useState('all');

  const totalSourcesCount = supporting.length + contradicting.length + context.length;

  return (
    <div className="space-y-4">
      {/* Search Provider Transparency Banner */}
      {searchMetadata && (
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Search className="w-3.5 h-3.5 text-sky-400" />
              Evidence Retrieval Providers
            </span>
            {searchMetadata.searchQuery && (
              <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                Query: "{searchMetadata.searchQuery}"
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            {searchMetadata.providersQueried && searchMetadata.providersQueried.map((provider, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
              >
                <CheckCircle2 className="w-3 h-3" />
                {provider}
              </span>
            ))}
            {searchMetadata.providersMissingConfig && searchMetadata.providersMissingConfig.map((msg, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium"
                title="Optional provider not configured in backend/.env"
              >
                <AlertCircle className="w-3 h-3" />
                {msg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          All Sources ({totalSourcesCount})
        </button>
        <button
          onClick={() => setActiveTab('supporting')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'contradicting'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-rose-500'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          Contradicting ({contradicting.length})
        </button>
        {context.length > 0 && (
          <button
            onClick={() => setActiveTab('context')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'context'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-sky-400'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Context ({context.length})
          </button>
        )}
      </div>

      {/* Supporting Evidence List */}
      {(activeTab === 'all' || activeTab === 'supporting') && supporting.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            Supporting Evidence & Verified Records ({supporting.length})
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
                    className="text-emerald-600 dark:text-emerald-400 hover:underline flex-shrink-0 flex items-center gap-1 text-xs"
                  >
                    View Source <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "{item.snippet || 'Factual corroboration documented in authoritative records.'}"
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {item.source}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  SUPPORTS
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
            Contradicting Evidence & Debunking Archives ({contradicting.length})
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
                    className="text-rose-600 dark:text-rose-400 hover:underline flex-shrink-0 flex items-center gap-1 text-xs"
                  >
                    View Source <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "{item.snippet || 'Official rebuttal or counter-evidence documented by monitors.'}"
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                <span className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {item.source}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">
                  CONTRADICTS
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

      {/* Context Evidence List */}
      {(activeTab === 'all' || activeTab === 'context') && context.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
            <Info className="w-4 h-4" />
            Topical Background & Reference Context ({context.length})
          </div>
          {context.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-sky-500/20 bg-sky-500/5 dark:bg-sky-950/20 space-y-1.5"
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
                    className="text-sky-400 hover:underline flex-shrink-0 flex items-center gap-1 text-xs"
                  >
                    View Source <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                "{item.snippet || 'Relevant contextual background regarding the referenced topic.'}"
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                <span className="font-semibold text-sky-300 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {item.source}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
                  CONTEXT
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

      {/* Empty States */}
      {totalSourcesCount === 0 && (
        <div className="p-6 text-center space-y-2 border border-dashed border-slate-700/60 rounded-2xl bg-slate-950/40">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-300">
            No direct external evidence sources were retrieved for this assertion.
          </p>
          <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
            TruthLens AI requires independent primary records before marking assertions as verified.
            Lack of external sources does not prove a claim is false, but leaves it awaiting secondary confirmation.
          </p>
        </div>
      )}
    </div>
  );
};

export default EvidencePanel;
