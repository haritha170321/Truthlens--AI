import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, ShieldCheck, Sparkles, Database, Search, FileText, Cpu } from 'lucide-react';

const STEPS = [
  { label: 'Reading and preprocessing article content...', icon: FileText },
  { label: 'Extracting factual and statistical claims...', icon: Cpu },
  { label: 'Analyzing emotional language, clickbait & syntax...', icon: Sparkles },
  { label: 'Checking source publisher credibility & domain SSL...', icon: Database },
  { label: 'Searching related external news & web reporting...', icon: Search },
  { label: 'Comparing supporting & contradicting evidence...', icon: ShieldCheck },
  { label: 'Calculating hybrid AI/ML confidence score...', icon: Loader2 },
  { label: 'Generating explainable verification report...', icon: CheckCircle2 },
];

export const LoadingAnalysisModal = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="w-full max-w-md bg-white dark:bg-[#0b1329] border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-2xl p-6 md:p-8 text-center relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-pulse"></div>

        {/* Pulsing Shield Icon */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 dark:bg-indigo-500/30 animate-ping"></div>
          <div className="relative w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-8 h-8 animate-spin-slow" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          AI Verification in Progress
        </h3>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-6">
          Analyzing across NLP models, fact checks, and source registries
        </p>

        {/* Step-by-step Pipeline Progress */}
        <div className="space-y-3 text-left mb-6">
          {STEPS.map((step, idx) => {
            const isPassed = idx < currentStep;
            const isCurrent = idx === currentStep;
            const Icon = step.icon;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-lg text-xs md:text-sm transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-800/50'
                    : isPassed
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-400 dark:text-slate-600 opacity-60'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin flex-shrink-0" />
                ) : (
                  <Icon className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, ((currentStep + 1) / STEPS.length) * 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnalysisModal;
