import React from 'react';

export const SimilarArticlesCard = ({ articles = [] }) => {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white">
        Similar News Coverage & Reporting
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

export default SimilarArticlesCard;
