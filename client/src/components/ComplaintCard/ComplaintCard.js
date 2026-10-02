import NextLink from 'next/link';
import { ArrowUpRight, MapPin, Calendar, Image as ImageIcon } from 'lucide-react';

export default function ComplaintCard({ complaint, href }) {
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700/60';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-700/50';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/50';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const targetHref = href || `/complaints/${complaint._id}`;

  return (
    <NextLink
      href={targetHref}
      className="p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 shadow-sm dark:bg-slate-900/70 dark:hover:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 dark:shadow-none transition-all flex flex-col justify-between group"
    >
      <div className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadge(complaint.status)}`}>
              {complaint.status.replace('_', ' ')}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getPriorityBadge(complaint.priority)}`}>
              {complaint.priority}
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
              {complaint.category}
            </span>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors shrink-0" />
        </div>

        <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
          {complaint.title}
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1 truncate max-w-[180px]">
          <MapPin className="w-3 h-3 text-slate-400" />
          {complaint.location}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {complaint.attachments?.length > 0 && (
            <span className="flex items-center gap-0.5 text-brand-600 dark:text-brand-400">
              <ImageIcon className="w-3 h-3" />
              {complaint.attachments.length}
            </span>
          )}
          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </NextLink>
  );
}
