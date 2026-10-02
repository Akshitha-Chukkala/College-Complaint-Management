import {
  CheckCircle2,
  Clock,
  UserCheck,
  Wrench,
  AlertCircle,
  FileCheck,
  Send
} from 'lucide-react';

export default function TimelineView({ timeline = [], currentStatus = 'submitted' }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Send className="w-4 h-4 text-slate-500 dark:text-slate-400" />;
      case 'under_review':
        return <Clock className="w-4 h-4 text-amber-500" />;
      case 'assigned':
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      case 'in_progress':
        return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'closed':
        return <FileCheck className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/50';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/50';
      case 'assigned':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/50';
      case 'under_review':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 dark:text-slate-500 text-xs">
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {timeline.map((event, idx) => {
        const isLatest = idx === timeline.length - 1;

        return (
          <div key={event._id || idx} className="relative group">
            {/* Timeline Node Point */}
            <div
              className={`absolute -left-[27px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                isLatest
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 shadow-md ring-4 ring-brand-500/10'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
              }`}
            >
              {getStatusIcon(event.newStatus)}
            </div>

            {/* Timeline Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/60 dark:border-slate-800/80 dark:shadow-none space-y-2 transition-colors">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(event.newStatus)}`}>
                    {event.newStatus.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {event.actionBy?.name || 'Authorized Official'}
                  </span>
                  {event.actionBy?.role && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                      ({event.actionBy.role})
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  {new Date(event.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {event.comment && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1 border-l-2 border-slate-200 dark:border-slate-700/60">
                  {event.comment}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
