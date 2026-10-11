import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ArrowRight, Calendar, Tag } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import { getSavedArticles, deleteSavedArticle } from '../services/newsService';

export const SavedArticlesPage = () => {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      const res = await getSavedArticles();
      if (res.success) setSaved(res.data);
    } catch (e) {
      console.warn('Saved fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleDelete = async (id) => {
    await deleteSavedArticle(id);
    setSaved(prev => prev.filter(s => (s._id || s.id) !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Saved News Analyses
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Personal bookmarked investigations and research references
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading bookmarks...</div>
      ) : saved.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-[#0b1329] rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3 p-8">
          <Bookmark className="w-12 h-12 mx-auto text-slate-400" />
          <p className="font-bold text-slate-700 dark:text-slate-300">No saved articles yet.</p>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            You can bookmark any news verification result while inspecting its explainable AI audit.
          </p>
          <Link to="/check" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30">
            Verify a News Story
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {saved.map((item) => {
            const id = item._id || item.id;
            const analysis = item.analysisId || {};
            const analysisId = analysis._id || analysis.id || item.analysisId;

            return (
              <div
                key={id}
                className="p-5 rounded-3xl bg-white dark:bg-[#0b1329] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3 hover:border-indigo-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <StatusBadge status={analysis.prediction || 'SAVED'} size="sm" />
                    <button
                      onClick={() => handleDelete(id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white line-clamp-2">
                    {item.title}
                  </h3>

                  {item.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {item.notes}
                    </p>
                  )}

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Saved'}
                  </span>

                  {analysisId && (
                    <Link
                      to={`/result/${analysisId}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                    >
                      View Audit <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedArticlesPage;
