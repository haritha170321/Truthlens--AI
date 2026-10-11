import React from 'react';
import { Layers, ExternalLink, ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';

export default function SimilarClaimsCard({ similarClaims }) {
  if (!similarClaims || similarClaims.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 text-center text-slate-400">
        <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-sm">No closely similar verified fact-checks found in current knowledge indices.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between gap-2 mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
              Similar Verified Fact-Checked Claims
            </h3>
            <p className="text-xs text-slate-400">
              Cosine vector proximity against accredited IFCN fact-checking records
            </p>
          </div>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
          {similarClaims.length} Matches Found
        </span>
      </div>

      {/* Epistemic Boundary Notice */}
      <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Epistemic Disclaimer: </span>
          Semantic similarity indicates lexical and conceptual closeness; it does <strong>not</strong> imply factual equivalence. Always inspect specific context.
        </div>
      </div>

      {/* List of Similar Claims */}
      <div className="space-y-3">
        {similarClaims.map((item, idx) => {
          const scorePercent = item.similarity_percentage || Math.round((item.similarity_score || 0) * 100);
          const isHigh = scorePercent >= 70;
          const isModerate = scorePercent >= 45 && scorePercent < 70;

          return (
            <div
              key={item.id || idx}
              className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-purple-500/40 transition-all group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30">
                    {item.organization || item.publisher || 'Verified Fact-Check'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                    item.verdict?.toLowerCase().includes('false') || item.stance === 'CONTRADICTS'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : (item.verdict?.toLowerCase().includes('true') || item.stance === 'SUPPORTS'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20')
                  }`}>
                    Verdict: {item.verdict || (item.stance === 'SUPPORTS' ? 'Supported' : 'Contradicted')}
                  </span>
                </div>

                {/* Similarity Badge */}
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-400">Semantic Proximity:</span>
                  <span className={`font-bold px-2 py-0.5 rounded-md ${
                    isHigh ? 'bg-purple-600/30 text-purple-300' : isModerate ? 'bg-sky-600/30 text-sky-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {scorePercent}%
                  </span>
                </div>
              </div>

              {/* Matched Claim Statement */}
              <h4 className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors mb-2">
                "{item.matched_claim || item.matchedClaim}"
              </h4>

              {/* Match Explanation */}
              {item.explanation && (
                <div className="flex items-start gap-1.5 text-xs text-slate-400 bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 mb-2">
                  <Info className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>{item.explanation}</span>
                </div>
              )}

              {/* Context / Excerpt & Working Link */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-400">
                  Published: {item.publish_date || item.publishDate || 'Archived record'}
                </span>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    View Original Fact-Check Audit <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
