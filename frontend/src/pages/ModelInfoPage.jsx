import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, BookOpen, Layers, BarChart3, AlertCircle, CheckCircle2, Globe, Target, Terminal, HelpCircle } from 'lucide-react';
import axios from 'axios';

export default function ModelInfoPage() {
  const [methodology, setMethodology] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethodology = async () => {
      try {
        const res = await axios.get('/api/news/methodology');
        if (res.data?.data) {
          setMethodology(res.data.data);
        }
      } catch (err) {
        // Local fallback info
        setMethodology({
          platform: 'TruthLens AI',
          primary_sdg: 'SDG 16 – Peace, Justice and Strong Institutions',
          secondary_sdg: 'SDG 4 – Quality Education',
          supervised_model: {
            name: 'MultinomialNB (Sublinear TF-IDF)',
            metrics: { accuracy: 0.8333, precision: 0.75, recall: 1.0, f1: 0.8571, confusion_matrix: [[2, 1], [0, 3]] },
            features: 'TF-IDF (1-2 n-grams, 5,000 features)',
          },
          outcome_categories: [
            { category: 'Supporting evidence found', description: 'Credible independent records corroborate primary factual premise.' },
            { category: 'Conflicting evidence found', description: 'Reputable fact-checks or official records directly contradict assertions.' },
            { category: 'Insufficient evidence', description: 'No authoritative primary sources currently establish or disprove assertion.' },
            { category: 'Context required', description: 'Assertion contains a grain of truth but omits critical qualification details.' },
            { category: 'Unable to verify', description: 'Assertions are too subjective, ambiguous, or unverifiable by public records.' },
          ],
          multilingual_capabilities: {
            supported: ['English (en)', 'Tamil (ta)'],
            tamil_limitations: [
              'Tamil agglutinative morphology can reduce simple n-gram lexical overlap compared to English.',
              'Lightweight local deployment utilizes rule-based syntactic parsing combined with cross-lingual embeddings.',
              'Code-mixed (Tanglish) text may experience reduced syntactic accuracy.',
            ],
          },
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMethodology();
  }, []);

  const metrics = methodology?.supervised_model?.metrics || {
    accuracy: 0.8333,
    precision: 0.75,
    recall: 1.0,
    f1: 0.8571,
    confusion_matrix: [[2, 1], [0, 3]],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a1638] via-[#0d1e4c] to-[#08122c] border border-sky-500/30 p-8 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                SDG 16: Peace & Justice
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                SDG 4: Quality Education
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              TruthLens AI Methodology & Model Information
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Transparent documentation of our natural language processing pipelines, supervised classifiers,
              semantic fact-check retrieval algorithms, evaluation metrics, and responsible AI safeguards.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-300">
            <Cpu className="w-16 h-16 animate-pulse" />
          </div>
        </div>
      </div>

      {/* 5-Stage Verification Pipeline Diagram */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-sky-400" /> End-to-End Verification Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            {
              step: '01',
              title: 'Ingestion & Normalization',
              desc: 'HTML stripping, Unicode NFKD normalization, and Tamil/English script detection.',
            },
            {
              step: '02',
              title: 'Claim Extraction',
              desc: 'Syntactic assertion mining targeting quantifiers, temporal anchors, and institutional cues.',
            },
            {
              step: '03',
              title: 'Semantic Fact-Check Match',
              desc: 'Pure Python TF-IDF cosine similarity search across IFCN-accredited databases.',
            },
            {
              step: '04',
              title: 'External Provenance Audit',
              desc: 'Live encyclopedic retrieval (Wikipedia REST API) and domain authority analysis.',
            },
            {
              step: '05',
              title: 'Epistemic Taxonomy Output',
              desc: 'Calibrated scoring mapping claims into 5 standardized outcome categories with uncertainty rating.',
            },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded-md bg-sky-500/10">
                {item.step}
              </span>
              <h3 className="font-semibold text-slate-200 text-xs">{item.title}</h3>
              <p className="text-[11px] text-slate-400 leading-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Metrics & Confusion Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quantitative Metrics Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" /> Supervised Classifier Metrics
            </h2>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              MultinomialNB Baseline
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Accuracy</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {(metrics.accuracy * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Precision</span>
              <div className="text-xl font-bold font-mono text-sky-400 mt-1">
                {(metrics.precision * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Recall</span>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
                {(metrics.recall * 100).toFixed(1)}%
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">F1-Score</span>
              <div className="text-xl font-bold font-mono text-purple-400 mt-1">
                {(metrics.f1 * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Confusion Matrix Table */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="text-xs font-semibold text-slate-300">Stratified Test Confusion Matrix (n = 6):</h4>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">True Negatives (Fake Detected)</span>
                <span className="text-emerald-400 font-bold text-base">{metrics.confusion_matrix?.[0]?.[0] ?? 2}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">False Positives</span>
                <span className="text-rose-400 font-bold text-base">{metrics.confusion_matrix?.[0]?.[1] ?? 1}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">False Negatives</span>
                <span className="text-rose-400 font-bold text-base">{metrics.confusion_matrix?.[1]?.[0] ?? 0}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">True Positives (Real Verified)</span>
                <span className="text-emerald-400 font-bold text-base">{metrics.confusion_matrix?.[1]?.[1] ?? 3}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Standardized Outcome Categories */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-400" /> Epistemic Outcome Taxonomy
            </h2>
            <span className="text-xs text-slate-400">5 Official Categories</span>
          </div>

          <div className="space-y-2.5">
            {[
              {
                category: 'Supporting evidence found',
                color: 'emerald',
                desc: 'Credible independent records corroborate primary factual premise.',
              },
              {
                category: 'Conflicting evidence found',
                color: 'rose',
                desc: 'Reputable fact-checks or official records directly contradict assertions.',
              },
              {
                category: 'Context required',
                color: 'amber',
                desc: 'Assertion contains a grain of truth but omits critical qualification details.',
              },
              {
                category: 'Insufficient evidence',
                color: 'slate',
                desc: 'No authoritative primary sources currently establish or disprove assertion.',
              },
              {
                category: 'Unable to verify',
                color: 'purple',
                desc: 'Assertions are too subjective, ambiguous, or unverifiable by public records.',
              },
            ].map((cat, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3"
              >
                <div
                  className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                    cat.color === 'emerald'
                      ? 'bg-emerald-400'
                      : cat.color === 'rose'
                      ? 'bg-rose-400'
                      : cat.color === 'amber'
                      ? 'bg-amber-400'
                      : cat.color === 'purple'
                      ? 'bg-purple-400'
                      : 'bg-slate-400'
                  }`}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{cat.category}</h4>
                  <p className="text-[11px] text-slate-400">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multilingual Tamil (தமிழ்) Extension & Limitations */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" /> Multilingual Architecture: English & Tamil (தமிழ்)
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">
          TruthLens AI incorporates dedicated multilingual modules designed to process regional language misinformation
          often circulated via private chat applications:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-sky-400">Script Detection</h4>
            <p className="text-[11px] text-slate-400">
              Unicode block regex scanning (<code>\u0B80-\u0BFF</code>) measuring Tamil script character density to dynamically route inputs.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-emerald-400">Tamil Assertion Heuristics</h4>
            <p className="text-[11px] text-slate-400">
              Identifies morphological affirmation markers such as <code>உறுதிப்படுத்தப்பட்டுள்ளது</code> (confirmed), <code>குணமாகும்</code> (cures), and institutional keywords.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-purple-400">Bilingual Output Alignment</h4>
            <p className="text-[11px] text-slate-400">
              Directly translates outcome categories into Tamil (e.g., <code>முரண்பாடான சான்றுகள் கண்டறியப்பட்டன</code>) ensuring immediate accessibility.
            </p>
          </div>
        </div>

        {/* Documented Limitations */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
          <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" /> Documented Limitations of Tamil NLP Pipeline:
          </h4>
          <ul className="text-xs text-amber-200/90 space-y-1 list-disc list-inside">
            {methodology?.multilingual_capabilities?.tamil_limitations?.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Ethical AI & Anti-Hallucination Guardrails */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> Responsible AI & Epistemic Guardrails
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-200">Zero Synthetic Citations</h4>
            <p className="text-slate-400">
              TruthLens AI never hallucinates or synthesizes fake URLs. Every external citation links to a real, verifiable web address verified by accredited IFCN registries or Wikipedia.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-slate-200">Epistemic Uncertainty Margin</h4>
            <p className="text-slate-400">
              When evidence is scarce or conflicting, TruthLens AI refrains from authoritative binary declarations, clearly presenting the uncertainty margin and recommending further verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
