import React from 'react';
import { Layers, Sliders, Brain, FileCheck, Shield, Sparkles } from 'lucide-react';

export const HybridScoringBreakdown = ({ breakdown = {} }) => {
  const {
    mlScore = 50,
    llmScore = 50,
    sourceScore = 50,
    evidenceScore = 50,
    linguisticScore = 50,
  } = breakdown;

  const signals = [
    { label: 'Machine Learning Model', weight: '30%', score: mlScore, icon: Brain, color: 'text-indigo-500', barColor: 'bg-indigo-500' },
    { label: 'External Evidence Matching', weight: '25%', score: evidenceScore, icon: FileCheck, color: 'text-emerald-500', barColor: 'bg-emerald-500' },
    { label: 'Source Credibility & Reputation', weight: '20%', score: sourceScore, icon: Shield, color: 'text-blue-500', barColor: 'bg-blue-500' },
    { label: 'LLM Multi-Claim Reasoning', weight: '15%', score: llmScore, icon: Sparkles, color: 'text-purple-500', barColor: 'bg-purple-500' },
    { label: 'Linguistic & Neutrality Score', weight: '10%', score: linguisticScore, icon: Sliders, color: 'text-amber-500', barColor: 'bg-amber-500' },
  ];

  return (
    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
          <Layers className="w-4 h-4 text-indigo-500" />
          Transparent Hybrid Multi-Signal Scoring Fusion
        </div>
      </div>

      <div className="space-y-2.5">
        {signals.map((sig, idx) => {
          const Icon = sig.icon;
          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                  <Icon className={`w-3.5 h-3.5 ${sig.color}`} />
                  {sig.label}
                  <span className="text-[10px] text-slate-400">({sig.weight})</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{sig.score}/100</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`${sig.barColor} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${sig.score}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SimilarArticlesCard = ({ articles = [] }) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
        Similar Reporting & Context
      </h4>
      <div className="space-y-2">
        {articles.map((art, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5 truncate">
              <span className="font-semibold text-slate-900 dark:text-white block truncate">
                {art.title}
              </span>
              <span className="text-slate-400 text-[11px]">
                {art.publisher} {art.date && `• ${art.date}`}
              </span>
            </div>
            {art.url && (
              <a
                href={art.url}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold flex-shrink-0 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                View
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HybridScoringBreakdown;
