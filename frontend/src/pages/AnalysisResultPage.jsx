import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Download,
  Bookmark,
  Share2,
  Calendar,
  User,
  Globe,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
  FileSpreadsheet,
  Code,
  FileCode,
  Box,
  Scale,
  Clock,
  MessageSquare,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import ConfidenceGauge from '../components/common/ConfidenceGauge';
import ClaimsList from '../components/result/ClaimsList';
import EvidencePanel from '../components/result/EvidencePanel';
import IndicatorsCard from '../components/result/IndicatorsCard';
import SourceCredibilityCard from '../components/result/SourceCredibilityCard';
import SimilarArticlesCard from '../components/result/SimilarArticlesCard';
import SimilarClaimsCard from '../components/result/SimilarClaimsCard';
import SpatialEvidenceGraph from '../components/result/SpatialEvidenceGraph';
import InteractiveEvidenceComparison from '../components/result/InteractiveEvidenceComparison';
import PublicationTimeline from '../components/result/PublicationTimeline';
import UserFeedbackWidget from '../components/result/UserFeedbackWidget';
import HybridScoringBreakdown from '../components/result/HybridScoringBreakdown';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import DemoBadge from '../components/common/DemoBadge';
import { getAnalysisDetails, saveArticle } from '../services/newsService';
import { downloadPDFReport, downloadJSONReport, downloadMarkdownReport, downloadCSVReport } from '../services/reportGenerator';

export const AnalysisResultPage = () => {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeTab, setActiveTab] = useState('3d_graph'); // '3d_graph' | 'evidence_comparison' | 'timeline' | 'similar_claims'
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await getAnalysisDetails(id);
        if (res.success && res.data) {
          setAnalysis(res.data);
        }
      } catch (err) {
        console.warn('Error fetching analysis', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [id]);

  const handleSave = async () => {
    if (!analysis) return;
    try {
      await saveArticle({
        analysisId: analysis._id || analysis.id,
        title: analysis.headline || 'Saved News Analysis',
        notes: `Verification score: ${analysis.finalConfidence || analysis.confidenceScore}% (${analysis.outcomeCategory || analysis.prediction})`,
        tags: [analysis.outcomeCategory || analysis.prediction, analysis.inputType || 'TEXT'],
      });
      setSaveStatus('Bookmarked!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (e) {
      setSaveStatus('Already saved or offline.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading TruthLens AI verification audit...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 text-center bg-white dark:bg-[#0b1329] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested analysis may have expired or was removed.</p>
        <Link
          to="/check"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-xs"
        >
          Verify Another Story
        </Link>
      </div>
    );
  }

  const outcome = (analysis.outcomeCategory || analysis.prediction || 'Unable to verify').toLowerCase();
  const isSupporting = outcome.includes('supporting') || outcome.includes('real');
  const isConflicting = outcome.includes('conflicting') || outcome.includes('fake');
  const isContext = outcome.includes('context') || outcome.includes('misleading');
  const isInsufficient = outcome.includes('insufficient');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-sky-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </button>

        {/* Multi-Format Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {analysis.isDemoData && <DemoBadge />}

          {/* PDF Report Export */}
          <button
            onClick={() => downloadPDFReport(analysis)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold shadow-sm hover:border-sky-500/40 transition-colors"
            title="Download Cryptographically Fingerprinted Audit PDF"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            PDF Dossier
          </button>

          {/* JSON Export */}
          <button
            onClick={() => downloadJSONReport(analysis)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold shadow-sm hover:border-purple-500/40 transition-colors"
            title="Download Raw Machine-Readable JSON Data"
          >
            <Code className="w-3.5 h-3.5 text-purple-400" />
            JSON
          </button>

          {/* Markdown Report Export */}
          <button
            onClick={() => downloadMarkdownReport(analysis)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold shadow-sm hover:border-emerald-500/40 transition-colors"
            title="Download Markdown Document for Journalists"
          >
            <FileCode className="w-3.5 h-3.5 text-emerald-400" />
            Markdown
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-bold hover:bg-sky-500/20 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5" />
            {saveStatus || 'Bookmark'}
          </button>

          {/* New Verification */}
          <Link
            to="/check"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-600/30 hover:bg-sky-500 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            New Verify
          </Link>
        </div>
      </div>

      {/* Main Top Verdict Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 ${
          isSupporting
            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-[#04091a] border-emerald-500/30'
            : isConflicting
            ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-[#04091a] border-rose-500/30'
            : isContext
            ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-[#04091a] border-amber-500/30'
            : isInsufficient
            ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-[#04091a] border-slate-700/50'
            : 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-[#04091a] border-purple-500/30'
        }`}
      >
        <div className="space-y-3 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <StatusBadge status={analysis.outcomeCategory || analysis.prediction} size="lg" />
            <span className="text-xs font-mono text-slate-400">
              Evaluated: {new Date(analysis.createdAt || Date.now()).toLocaleDateString()}
            </span>
            {analysis.language && (
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                Lang: {analysis.language === 'ta' ? 'தமிழ் (Tamil)' : 'English'}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
            {analysis.headline || 'Submitted News Analysis'}
          </h1>

          {/* Quick Provenance Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400">
            {analysis.publisher && (
              <span className="flex items-center gap-1 text-slate-300">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                {analysis.publisher}
              </span>
            )}
            {analysis.author && (
              <span className="flex items-center gap-1 text-slate-300">
                <User className="w-3.5 h-3.5 text-sky-400" />
                {analysis.author}
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
              Input: {analysis.inputType || 'TEXT'}
            </span>
          </div>
        </div>

        {/* Dual Gauge Component: Confidence Score & Uncertainty Margin */}
        <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Confidence Score
            </span>
            <ConfidenceGauge
              score={analysis.finalConfidence || analysis.confidenceScore || 85}
              level={analysis.confidenceLevel || 'Evaluated Confidence'}
              size="md"
            />
          </div>

          <div className="h-16 w-px bg-slate-800"></div>

          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Uncertainty Margin
            </span>
            <div className="text-2xl font-black font-mono text-amber-400">
              {analysis.uncertaintyScore || 15}%
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {analysis.uncertaintyScore < 20 ? 'Low Margin' : analysis.uncertaintyScore < 40 ? 'Moderate' : 'High Ambiguity'}
            </span>
          </div>
        </div>
      </div>

      {/* Epistemic Guardrail Notice */}
      <DisclaimerBanner />

      {/* Interactive Analytical Deep-Dive Tabs */}
      <div className="bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveTab('3d_graph')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === '3d_graph'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Box className="w-4 h-4" /> 3D Spatial Relationship Topology
        </button>

        <button
          onClick={() => setActiveTab('evidence_comparison')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'evidence_comparison'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Scale className="w-4 h-4" /> Interactive Evidence Comparison
        </button>

        <button
          onClick={() => setActiveTab('similar_claims')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'similar_claims'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> Similar Verified Fact-Checks ({analysis.similarClaims?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'timeline'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" /> Chronological Timeline
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === '3d_graph' && (
        <SpatialEvidenceGraph analysis={analysis} />
      )}

      {activeTab === 'evidence_comparison' && (
        <InteractiveEvidenceComparison
          claims={analysis.claims || []}
          supportingEvidence={analysis.supportingEvidence || []}
          contradictingEvidence={analysis.contradictingEvidence || []}
          contextEvidence={analysis.contextEvidence || []}
        />
      )}

      {activeTab === 'similar_claims' && (
        <SimilarClaimsCard similarClaims={analysis.similarClaims || []} />
      )}

      {activeTab === 'timeline' && (
        <PublicationTimeline analysis={analysis} />
      )}

      {/* Main 2-Column Responsive Layout for Explainable AI & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Explainable AI & Claims Breakdown (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Explainable AI Reasoning Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <h3 className="text-base sm:text-lg font-bold text-white">
                Explainable AI Reasoning & Provenance
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
              {analysis.aiExplanation?.summary ||
                'Multi-source natural language analysis evaluated grammatical, lexical, and external evidence signals.'}
            </p>

            {analysis.aiExplanation?.keyFactors && analysis.aiExplanation.keyFactors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Key Decisive Factors
                </span>
                <ul className="space-y-2 text-xs text-slate-300">
                  {analysis.aiExplanation.keyFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.aiExplanation?.recommendations && (
              <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-200 space-y-1">
                <span className="font-bold block">Verification Recommendations:</span>
                {analysis.aiExplanation.recommendations.map((rec, idx) => (
                  <p key={idx}>• {rec}</p>
                ))}
              </div>
            )}
          </div>

          {/* Discrete Extracted Claims Assertions */}
          <ClaimsList claims={analysis.claims || []} />

          {/* Evidence Citations Panel */}
          <EvidencePanel
            supporting={analysis.supportingEvidence || []}
            contradicting={analysis.contradictingEvidence || []}
          />
        </div>

        {/* RIGHT COLUMN: Scoring Breakdown, Source Credibility & Feedback (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Hybrid Weighted Scoring Breakdown */}
          <HybridScoringBreakdown
            breakdown={analysis.scoreBreakdown}
            compositeScore={analysis.compositeReliabilityIndex || analysis.finalConfidence}
          />

          {/* Source Credibility Audit */}
          <SourceCredibilityCard
            sourceCredibility={analysis.sourceCredibility}
            publisher={analysis.publisher}
          />

          {/* Linguistic & Clickbait Indicators */}
          <IndicatorsCard
            indicators={analysis.suspiciousIndicators || []}
            sentiment={analysis.sentiment}
          />

          {/* User Feedback Widget */}
          <UserFeedbackWidget analysisId={analysis._id || analysis.id} />
        </div>
      </div>
    </div>
  );
};

export default AnalysisResultPage;
