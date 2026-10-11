import React from 'react';
import { Calendar, Clock, ExternalLink, CheckCircle2, XCircle, AlertCircle, Bookmark } from 'lucide-react';

export default function PublicationTimeline({ analysis }) {
  if (!analysis) return null;

  // Build events array from analysis evidence and timestamps
  const events = React.useMemo(() => {
    const list = [];

    // Initial claim event
    list.push({
      date: analysis.createdAt ? new Date(analysis.createdAt).toISOString().split('T')[0] : 'Current Audit',
      title: 'Claim Analyzed on TruthLens AI',
      publisher: analysis.publisher || 'User Ingestion',
      stance: 'CLAIM',
      url: analysis.url || '',
      snippet: analysis.headline || analysis.content?.substring(0, 80) + '...',
    });

    // Supporting evidence events
    (analysis.supportingEvidence || []).forEach(e => {
      list.push({
        date: e.publishedDate || '2024-05-30',
        title: e.title || 'Supporting Article',
        publisher: e.source || 'Journalistic Outlet',
        stance: 'SUPPORTS',
        url: e.url || '',
        snippet: e.snippet || '',
      });
    });

    // Contradicting evidence events
    (analysis.contradictingEvidence || []).forEach(e => {
      list.push({
        date: e.publishedDate || '2022-04-11',
        title: e.title || 'Fact-Check Debunk',
        publisher: e.source || 'Fact-Check Desk',
        stance: 'CONTRADICTS',
        url: e.url || '',
        snippet: e.snippet || '',
      });
    });

    // Similar claims events
    (analysis.similarClaims || []).forEach(sc => {
      list.push({
        date: sc.publish_date || sc.publishDate || 'Archived',
        title: `Fact-Check: ${sc.matched_claim || sc.matchedClaim}`,
        publisher: sc.organization || 'IFCN Signatory',
        stance: sc.stance || 'CONTEXT',
        url: sc.url || '',
        snippet: sc.explanation || sc.context || '',
      });
    });

    // Sort chronologically if possible
    list.sort((a, b) => {
      if (a.date === 'Archived' || a.date === 'Recent') return 1;
      if (b.date === 'Archived' || b.date === 'Recent') return -1;
      return a.date.localeCompare(b.date);
    });

    return list;
  }, [analysis]);

  if (events.length <= 1) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800/80 pb-3">
        <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
            Chronological Publication & Verification Timeline
          </h3>
          <p className="text-xs text-slate-400">
            Evolution of reporting, official statements, and independent fact-checks over time
          </p>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.map((ev, idx) => {
          let dotColor = 'bg-sky-500 ring-sky-500/30';
          let borderHover = 'hover:border-sky-500/40';
          let stanceBadge = null;

          if (ev.stance === 'SUPPORTS') {
            dotColor = 'bg-emerald-500 ring-emerald-500/30';
            borderHover = 'hover:border-emerald-500/40';
            stanceBadge = <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Supporting</span>;
          } else if (ev.stance === 'CONTRADICTS') {
            dotColor = 'bg-rose-500 ring-rose-500/30';
            borderHover = 'hover:border-rose-500/40';
            stanceBadge = <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">Conflicting</span>;
          } else if (ev.stance === 'CLAIM') {
            dotColor = 'bg-sky-400 ring-sky-400/40';
            borderHover = 'hover:border-sky-500/40';
            stanceBadge = <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold">Investigated Narrative</span>;
          } else {
            dotColor = 'bg-amber-500 ring-amber-500/30';
            borderHover = 'hover:border-amber-500/40';
            stanceBadge = <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">Context</span>;
          }

          return (
            <div key={idx} className="relative group">
              {/* Timeline Marker Dot */}
              <div
                className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ${dotColor} transition-transform group-hover:scale-125`}
              />

              {/* Event Card */}
              <div className={`p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 transition-all ${borderHover}`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {ev.date}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">• {ev.publisher}</span>
                  </div>
                  {stanceBadge}
                </div>

                <h4 className="text-xs font-medium text-slate-200 mb-1">
                  {ev.title}
                </h4>

                {ev.snippet && (
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                    "{ev.snippet}"
                  </p>
                )}

                {ev.url && (
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                  >
                    View Record <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
