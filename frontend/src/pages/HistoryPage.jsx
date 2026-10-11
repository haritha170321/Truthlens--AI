import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import DemoBadge from '../components/common/DemoBadge';
import { getNewsHistory, deleteAnalysisRecord, clearAllNewsHistory } from '../services/newsService';
import { downloadCSVReport } from '../services/reportGenerator';

export const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getNewsHistory({
        status: filterStatus,
        inputType: filterType,
        search: searchQuery,
      });
      if (res.success) {
        setHistory(res.data);
      }
    } catch (e) {
      console.warn('History fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterStatus, filterType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this verification audit record?')) {
      await deleteAnalysisRecord(id);
      setHistory(prev => prev.filter(item => (item._id || item.id) !== id));
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire verification history? All audit records will be removed.')) {
      setIsClearing(true);
      try {
        await clearAllNewsHistory();
        setHistory([]);
      } catch (e) {
        console.warn('Failed to clear history', e);
        setHistory([]);
      } finally {
        setIsClearing(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Verification History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Browse and export all previously analyzed news claims and audit reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleClearAll}
            disabled={history.length === 0 || isClearing}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs transition-all"
            title="Clear all verification history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isClearing ? 'Clearing...' : 'Clear All History'}
          </button>

          <button
            onClick={() => downloadCSVReport(history)}
            disabled={history.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export All Audit Records (CSV)
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified headlines, keywords, or publishers..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Status:
            </span>
            {['ALL', 'REAL', 'LIKELY REAL', 'MISLEADING', 'LIKELY FAKE', 'UNVERIFIED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-400 mr-1">Input:</span>
            {['ALL', 'TEXT', 'URL', 'IMAGE', 'PDF'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterType === type
                    ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* History Items Listing */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading audit archive...</div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-[#0b1329] rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <History className="w-10 h-10 mx-auto text-slate-400" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No records found for current filters.</p>
          <Link to="/check" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
            Run a News Analysis
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const id = item._id || item.id;
            return (
              <div
                key={id}
                className="p-5 rounded-2xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={item.prediction} size="sm" />
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.inputType || 'TEXT'}
                    </span>
                    {item.isDemoData && <DemoBadge />}
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2">
                    {item.headline || item.title || 'Untitled Article'}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{item.publisher || 'Direct Submission'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-xs text-slate-400 block">Confidence</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {item.finalConfidence || 75}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/result/${id}`}
                      className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors flex items-center gap-1"
                    >
                      Audit <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(id)}
                      title="Delete Record"
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
