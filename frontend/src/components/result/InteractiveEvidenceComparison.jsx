import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Calendar, ShieldCheck, Scale, Filter } from 'lucide-react';

export default function InteractiveEvidenceComparison({
  claims = [],
  supportingEvidence = [],
  contradictingEvidence = [],
  contextEvidence = [],
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [selectedClaimIdx, setSelectedClaimIdx] = useState(0);

  const totalSupporting = supportingEvidence.length;
  const totalContradicting = contradictingEvidence.length;
  const totalContext = contextEvidence.length;

  const currentClaim = claims[selectedClaimIdx]?.claim || 'Primary Investigated Narrative';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
              Interactive Evidence Comparison & Stance Audit
            </h3>
            <p className="text-xs text-slate-400">
              Corroborating vs contradictory vs contextual reporting from accredited sources
            </p>
          </div>
        </div>

        {/* Stance Filter Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeFilter === 'ALL' ? 'bg-sky-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalSupporting + totalContradicting + totalContext})
          </button>
          <button
            onClick={() => setActiveFilter('SUPPORTS')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === 'SUPPORTS' ? 'bg-emerald-600 text-white font-medium' : 'text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Supporting ({totalSupporting})
          </button>
          <button
            onClick={() => setActiveFilter('CONTRADICTS')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === 'CONTRADICTS' ? 'bg-rose-600 text-white font-medium' : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" /> Conflicting ({totalContradicting})
          </button>
          <button
            onClick={() => setActiveFilter('CONTEXT')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              activeFilter === 'CONTEXT' ? 'bg-amber-600 text-white font-medium' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" /> Context ({totalContext})
          </button>
        </div>
      </div>

      {/* Discrete Claim Selector if multiple claims exist */}
      {claims.length > 1 && (
        <div className="mb-4 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Select Extracted Claim to Compare Evidence:
          </span>
          <div className="flex flex-wrap gap-2">
            {claims.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedClaimIdx(idx)}
                className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all ${
                  selectedClaimIdx === idx
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-medium'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Claim #{idx + 1}: {c.claim.substring(0, 45)}...
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supporting Column */}
        {(activeFilter === 'ALL' || activeFilter === 'SUPPORTS') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider border-b border-emerald-500/20 pb-2">
              <CheckCircle2 className="w-4 h-4" /> Supporting Evidence ({totalSupporting})
            </div>
            {supportingEvidence.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                No verified independent evidence directly supporting this premise was identified.
              </div>
            ) : (
              supportingEvidence.map((ev, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-emerald-300">
                      {ev.source}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {ev.publishedDate || 'Recent'}
                    </span>
                  </div>
                  <h5 className="text-xs font-medium text-slate-200 mb-1">
                    {ev.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 mb-2">
                    "{ev.snippet}"
                  </p>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      Verify Primary Citation <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Conflicting Column */}
        {(activeFilter === 'ALL' || activeFilter === 'CONTRADICTS') && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider border-b border-rose-500/20 pb-2">
              <XCircle className="w-4 h-4" /> Conflicting Evidence ({totalContradicting})
            </div>
            {contradictingEvidence.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
                No accredited fact-checks or primary records directly contradicting this claim were located.
              </div>
            ) : (
              contradictingEvidence.map((ev, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-950/10 hover:border-rose-500/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-rose-300">
                      {ev.source}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {ev.publishedDate || 'Recent'}
                    </span>
                  </div>
                  <h5 className="text-xs font-medium text-slate-200 mb-1">
                    {ev.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 mb-2">
                    "{ev.snippet}"
                  </p>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 font-medium"
                    >
                      Inspect Counter-Evidence <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Contextual Nuance Column (if active or present) */}
        {(activeFilter === 'ALL' || activeFilter === 'CONTEXT') && totalContext > 0 && (
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider border-b border-amber-500/20 pb-2">
              <AlertCircle className="w-4 h-4" /> Contextual & Encyclopedic Background ({totalContext})
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contextEvidence.map((ev, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/10 hover:border-amber-500/40 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-amber-300">
                      {ev.source}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {ev.publishedDate || 'Recent'}
                    </span>
                  </div>
                  <h5 className="text-xs font-medium text-slate-200 mb-1">
                    {ev.title}
                  </h5>
                  <p className="text-[11px] text-slate-300 mb-2">
                    "{ev.snippet}"
                  </p>
                  {ev.url && (
                    <a
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium"
                    >
                      Read Encyclopedic Context <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
