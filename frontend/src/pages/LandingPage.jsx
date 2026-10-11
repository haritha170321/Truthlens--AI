import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Search,
  FileText,
  Image,
  Globe,
  Sliders,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Box,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Cpu,
  Target,
  Scale,
} from 'lucide-react';
import DisclaimerBanner from '../components/common/DisclaimerBanner';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  
  const features = [
    {
      icon: Box,
      title: '3D Spatial Evidence Topology',
      description: 'Interact with WebGL 3D spatial network graphs linking claims, publishers, supporting citations, and fact-check audits.',
    },
    {
      icon: Layers,
      title: 'Semantic Similar Claim Retrieval',
      description: 'Calculates cosine vector proximity against accredited IFCN fact-checking databases with transparent match explanations.',
    },
    {
      icon: Scale,
      title: 'Epistemic Uncertainty Calibration',
      description: 'Categorizes outcomes into 5 standardized categories: Supporting, Conflicting, Insufficient, Context required, or Unable to verify.',
    },
    {
      icon: Globe,
      title: 'Multilingual Architecture (English & Tamil)',
      description: 'First-class language detection, Tamil morphological assertion mining, and bilingual verification outcomes.',
    },
    {
      icon: ShieldCheck,
      title: 'Independent Publisher Credibility',
      description: 'Audits domain authority, WHOIS maturity, and journalistic registries without confusing domain popularity with claim truth.',
    },
    {
      icon: Sliders,
      title: 'Discrete Factual Claim Extraction',
      description: 'Deconstructs long investigative stories and social media posts into individual verifiable assertions for drill-down analysis.',
    },
    {
      icon: BarChart3,
      title: 'Interactive Evidence Stance Audits',
      description: 'Side-by-side corroborating vs conflicting panels with publication timelines and working primary source links.',
    },
    {
      icon: FileSpreadsheet,
      title: 'Multi-Format Audit Export',
      description: 'Generate cryptographically fingerprinted PDF audit dossiers, raw JSON datasets, and Markdown briefs for journalists.',
    },
  ];

  const steps = [
    { step: '01', title: 'Submit Claim', desc: 'Paste text, enter a URL, or upload a news screenshot / PDF document.' },
    { step: '02', title: 'NLP Extraction', desc: 'Identifies discrete factual, statistical, and institutional assertions.' },
    { step: '03', title: 'Semantic Proximity', desc: 'Calculates vector cosine similarity against verified IFCN fact-checks.' },
    { step: '04', title: 'Provenance Search', desc: 'Queries Wikipedia REST API and accredited news registries for primary evidence.' },
    { step: '05', title: 'Epistemic Scoring', desc: 'Evaluates multi-factor weights and uncertainty margins without dogmatic labels.' },
    { step: '06', title: 'Interactive Dossier', desc: 'Explore 3D spatial relationship topology, evidence comparison, and export audit.' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 sm:pt-20 text-center px-4 max-w-5xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs md:text-sm font-semibold shadow-sm animate-fadeIn">
          <Sparkles className="w-4 h-4 text-sky-400" />
          <span>SDG 16: Peace & Justice</span>
          <span>•</span>
          <span>SDG 4: Quality Education</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
          TruthLens AI{' '}
          <span className="block bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-2">
            Explainable Verification Platform
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          An explainable intelligence engine combining natural language processing, semantic similarity,
          external evidence retrieval, and 3D spatial relationship topology to combat online misinformation.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            to="/check"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-sm md:text-base shadow-lg shadow-sky-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            Investigate a Claim
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/models"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm md:text-base transition-colors flex items-center justify-center gap-2"
          >
            <Cpu className="w-5 h-5 text-sky-400" />
            Model Architecture & Metrics
          </Link>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition-colors"
          >
            Analyst Dashboard
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Core Analytical Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Built for Explainability & Epistemic Humility
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            TruthLens AI communicates uncertainty, flags claims requiring further verification, and never synthesizes fake citations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-sky-500/40 transition-all space-y-3 group hover:shadow-xl"
              >
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-200">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6-Step Verification Pipeline */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
            Execution Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            From Raw Narrative to Verified Audit Dossier
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-3xl bg-slate-950/80 border border-slate-800 space-y-2 relative"
            >
              <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded-md bg-sky-500/10 inline-block">
                {s.step}
              </span>
              <h3 className="font-bold text-sm text-slate-200">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Epistemic Disclaimer Banner */}
      <div className="max-w-4xl mx-auto px-4">
        <DisclaimerBanner />
      </div>
    </div>
  );
};

export default LandingPage;
