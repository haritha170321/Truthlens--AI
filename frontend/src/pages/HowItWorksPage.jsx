import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sliders,
  ShieldCheck,
  Search,
  Database,
  FileCheck,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  Layers,
} from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export const HowItWorksPage = () => {
  const scoringFactors = [
    {
      title: 'Machine Learning Model (30%)',
      desc: 'TF-IDF n-gram vectorization combined with supervised classifiers (MultinomialNB, Logistic Regression, Random Forest) trained to identify linguistic structures of fabrication.',
    },
    {
      title: 'External Evidence Matching (25%)',
      desc: 'Queries NewsAPI and real-time news registries to find supporting or contradicting reporting from established journalistic wires.',
    },
    {
      title: 'Source Credibility & Reputation (20%)',
      desc: 'Evaluates domain age, SSL HTTPS integrity, publisher editorial pedigree, and compares against known satire/misleading blacklists.',
    },
    {
      title: 'LLM Multi-Claim Reasoning (15%)',
      desc: 'Deep generative LLM logic (Google Gemini) assessing claim plausibility, contextual coherence, and factual attribution.',
    },
    {
      title: 'Linguistic & Neutrality Score (10%)',
      desc: 'Measures clickbait sensationalism, manipulative urgency triggers ("before it is deleted"), all-caps emotional shouting, and syntactic anomalies.',
    },
  ];

  const verdicts = [
    { label: 'REAL', range: '90–100%', desc: 'Evidence strongly supports the core factual assertions from authoritative sources.' },
    { label: 'LIKELY REAL', range: '75–89%', desc: 'Most primary evidence corroborates the article, though developing details may emerge.' },
    { label: 'MISLEADING', range: '25–49%', desc: 'The content contains distorted, out-of-context, selective, or exaggerated assertions.' },
    { label: 'LIKELY FAKE', range: '0–24%', desc: 'Available evidence strongly contradicts claims or indicates fabricated misinformation.' },
    { label: 'UNVERIFIED', range: '50–74%', desc: 'Insufficient reliable evidence or anonymous attribution preventing definitive verification.' },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Architecture & Methodology
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          How TruthGuard Verifies Information
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
          Unlike black-box models that issue unsubstantiated judgments, TruthGuard uses an Explainable Hybrid AI framework combining linguistic analysis, trained ML, source reputation, and evidence verification.
        </p>
      </div>

      {/* Scoring Weight Breakdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-indigo-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Hybrid Multi-Modal Scoring Formula
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          No single algorithm is foolproof. TruthGuard aggregates five weighted verification signals to synthesize a transparent verification score:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scoringFactors.map((f, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5"
            >
              <h3 className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                {f.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Labels Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Standardized Verification Verdicts
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 text-slate-400 text-[10px] font-bold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Verdict Label</th>
                <th className="py-3 px-4">Confidence Tier</th>
                <th className="py-3 px-4">Criteria & Definition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {verdicts.map((v, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">
                    {v.label}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {v.range}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-xs">
                    {v.desc}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};

export default HowItWorksPage;
