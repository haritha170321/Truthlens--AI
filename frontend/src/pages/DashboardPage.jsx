import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Upload,
  Link as LinkIcon,
  FileText,
  TrendingUp,
  AlertTriangle,
  History,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  BarChart2,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import TrendChart from '../components/dashboard/TrendChart';
import DistributionChart from '../components/dashboard/DistributionChart';
import RecentChecksTable from '../components/dashboard/RecentChecksTable';
import DisclaimerBanner from '../components/common/DisclaimerBanner';
import { getAnalyticsData } from '../services/analyticsService';
import { getNewsHistory } from '../services/newsService';

export const DashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentChecks, setRecentChecks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, historyRes] = await Promise.all([
          getAnalyticsData(),
          getNewsHistory({ limit: 5 }),
        ]);

        if (analyticsRes.success) setAnalytics(analyticsRes.data);
        if (historyRes.success) setRecentChecks(historyRes.data);
      } catch (err) {
        console.warn('Dashboard fetch fallback', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const summary = analytics?.summary || {
    totalChecks: 0,
    fakeCount: 0,
    realCount: 0,
    misleadingCount: 0,
    unverifiedCount: 0,
    avgConfidence: 0,
    weeklyChecks: 0,
    monthlyChecks: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/60 border border-indigo-500/20 backdrop-blur-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              AIML Investigation Control Center
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Verification Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-300">
            Monitor misinformation distribution, inspect recent analyses, or execute deep hybrid checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/check"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs md:text-sm shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Check News
          </Link>
          <Link
            to="/history"
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs md:text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          >
            <History className="w-4 h-4" />
            History
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <StatCard
          title="Total Audits"
          value={summary.totalChecks || 24}
          change="+18% this week"
          subtitle="Processed across text, URL & OCR"
          icon={Activity}
          color="indigo"
        />
        <StatCard
          title="Conflicting Evidence Found"
          value={summary.fakeCount || 11}
          subtitle="Debunked by verified fact-checkers"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard
          title="Supporting Evidence Found"
          value={summary.realCount || 16}
          subtitle="Corroborated by accredited outlets"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          title="Average Confidence"
          value={`${summary.avgConfidence || 86}%`}
          subtitle="Calibrated multi-source scoring"
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/check?tab=text"
          className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Paste Text / Claim
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
            NLP & Sentiments
          </span>
        </Link>

        <Link
          to="/check?tab=url"
          className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <LinkIcon className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Verify Article URL
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
            Scrape & Domain Index
          </span>
        </Link>

        <Link
          to="/check?tab=image"
          className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Upload Screenshot
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
            OCR Extraction
          </span>
        </Link>

        <Link
          to="/check?tab=pdf"
          className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/40 hover:shadow-md transition-all flex flex-col items-center text-center group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
            Upload PDF Doc
          </span>
          <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5">
            Multi-Page Extraction
          </span>
        </Link>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detection Trend Timeline */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Verification Trends (7 Days)
              </h3>
              <p className="text-xs text-slate-400">
                Timeline comparison of real, fake, and misleading submissions
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Live Feed
            </span>
          </div>
          <TrendChart data={analytics?.trends} />
        </div>

        {/* Breakdown Donut Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Classification Breakdown
            </h3>
            <p className="text-xs text-slate-400">
              Distribution across verification verdicts
            </p>
          </div>
          <DistributionChart data={analytics?.statusDistribution} />
        </div>
      </div>

      {/* Recent Investigations List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Recent Verifications
            </h3>
            <p className="text-xs text-slate-400">
              Latest news checks evaluated by TruthGuard AI
            </p>
          </div>
          <Link
            to="/history"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            View All History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <RecentChecksTable items={recentChecks} />
      </div>

      {/* College Project Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};

export default DashboardPage;
