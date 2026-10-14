import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Search,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Calendar,
  Building,
  Info,
  Layers,
} from 'lucide-react';
import { searchGoogleFactCheck } from '../../services/newsService';

export default function GoogleFactCheckCard({ initialFactCheck = null, defaultQuery = '' }) {
  const [factCheckData, setFactCheckData] = useState(initialFactCheck);
  const [searchQuery, setSearchQuery] = useState(defaultQuery || initialFactCheck?.query || '');
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const handleManualSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery || !searchQuery.trim()) {
      setSearchError('Please enter a claim statement to search.');
      return;
    }

    setLoading(true);
    setSearchError('');

    try {
      const res = await searchGoogleFactCheck(searchQuery.trim());
      setFactCheckData(res);
      if (!res.success && res.message) {
        setSearchError(res.message);
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || err.message || 'Failed to query Google Fact Check Tools API.');
    } finally {
      setLoading(false);
    }
  };

  const status = factCheckData?.status || (factCheckData?.configured === false ? 'UNCONFIGURED' : 'INITIAL');
  const reviews = factCheckData?.reviews || [];

  const getRatingBadgeClass = (rating = '') => {
    const lower = rating.toLowerCase();
    if (
      lower.includes('false') ||
      lower.includes('fake') ||
      lower.includes('pants on fire') ||
      lower.includes('incorrect') ||
      lower.includes('untrue') ||
      lower.includes('debunk')
    ) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
    if (lower.includes('true') || lower.includes('correct') || lower.includes('accurate')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (
      lower.includes('misleading') ||
      lower.includes('half') ||
      lower.includes('partly') ||
      lower.includes('altered') ||
      lower.includes('context') ||
      lower.includes('exaggerated')
    ) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
    return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-100 text-sm sm:text-base tracking-wide">
                Google Fact Check Tools API
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30 font-mono">
                Official v1alpha1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              International Fact-Checking Network (IFCN) registry verification
            </p>
          </div>
        </div>

        {/* Status Indicator Pill */}
        <div className="flex items-center gap-2 text-xs">
          {status === 'MATCH_FOUND' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {reviews.length} Matching Review{reviews.length === 1 ? '' : 's'}
            </span>
          )}
          {status === 'NO_MATCH' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-medium">
              <HelpCircle className="w-3.5 h-3.5" />
              No Matching Review
            </span>
          )}
          {status === 'UNCONFIGURED' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              API Key Not Configured
            </span>
          )}
          {status === 'ERROR' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              Service Notice
            </span>
          )}
        </div>
      </div>

      {/* Interactive Fact-Check Search Bar */}
      <form onSubmit={handleManualSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search specific claim or keywords in Google Fact Check Tools..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-800 bg-slate-950/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/60 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 shadow-md shadow-blue-600/20"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {searchError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{searchError}</span>
        </div>
      )}

      {/* Mandatory Epistemic Disclaimers & State Content */}
      <div className="space-y-3">
        {/* CASE 1: MATCHING FACT-CHECK REVIEW FOUND */}
        {status === 'MATCH_FOUND' && reviews.length > 0 && (
          <div className="space-y-3">
            {/* Epistemic Guidance Banner */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
              <div>
                <strong>Epistemic Guidance:</strong> A fact-check rating belongs to the specific reviewed claim cited below. It must not be interpreted as a binary verdict on your overall article without verifying exact contextual phrasing, publishing date, and geographical relevance.
              </div>
            </div>

            {/* List of Reviews */}
            <div className="space-y-3">
              {reviews.map((rev, idx) => (
                <div
                  key={rev.id || idx}
                  className="p-4 rounded-xl border border-slate-800/90 bg-slate-950/70 hover:border-blue-500/30 transition-all space-y-2.5"
                >
                  {/* Top Bar: Publisher, Rating Badge, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        {rev.publisher}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-bold border ${getRatingBadgeClass(
                          rev.textualRating
                        )}`}
                      >
                        Rating: {rev.textualRating}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Reviewed: {rev.reviewDate || 'Recent'}</span>
                    </div>
                  </div>

                  {/* Reviewed Claim Text */}
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-0.5">
                      Audited Statement
                    </span>
                    <p className="text-sm font-medium text-slate-200 leading-snug">
                      "{rev.reviewedClaim}"
                    </p>
                    {rev.claimant && rev.claimant !== 'Unknown' && (
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Attributed Claimant: <strong className="text-slate-300">{rev.claimant}</strong>
                      </span>
                    )}
                  </div>

                  {/* External Audit Link */}
                  {rev.url && (
                    <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                      <a
                        href={rev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                      >
                        Read Full Independent Review <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CASE 2: NO MATCHING FACT-CHECK REVIEW FOUND */}
        {status === 'NO_MATCH' && (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-950/60 text-center space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-200">
              No Matching Fact-Check Review Found
            </h4>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              No authoritative fact-check was retrieved from the Google Fact Check Tools registry for query:{" "}
              <span className="text-slate-200 font-mono">"{factCheckData?.query || searchQuery}"</span>.
            </p>
            <div className="mt-3 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 text-left">
              <strong className="text-slate-300">Epistemic Note: </strong>
              The absence of a published fact-check record does <em>not</em> indicate whether this statement is accurate or inaccurate. Developing stories, local events, or unindexed claims frequently have no prior fact-check dossier. Cross-reference with primary portals and wire services.
            </div>
          </div>
        )}

        {/* CASE 3: UNCONFIGURED ENVIRONMENT KEY */}
        {status === 'UNCONFIGURED' && (
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Google Fact Check Tools API Key Not Configured</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              To query international fact-checks from accredited IFCN publishers (such as PolitiFact, FactCheck.org, Boom Live, and AltNews) via Google Fact Check Tools API:
            </p>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300">
              GOOGLE_FACTCHECK_API_KEY=&lt;your_google_cloud_api_key&gt;
            </div>
            <p className="text-[11px] text-slate-400">
              Add this key to <code className="text-slate-300">backend/.env</code> and restart the backend server. The app continues functioning seamlessly using existing encyclopedic registries and ML fallbacks.
            </p>
          </div>
        )}

        {/* CASE 4: API ERROR OR SERVICE NOTICE */}
        {status === 'ERROR' && (
          <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Google Fact Check Tools API Service Notice</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {factCheckData?.message || 'External Fact Check Tools service returned an unexpected response.'}
            </p>
            <p className="text-[11px] text-slate-400">
              Your other analysis metrics, ML inferences, and encyclopedic cross-references remain fully active and valid.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
