import { useEffect } from 'react';
import NextLink from 'next/link';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { useComplaintStore } from '../store/complaintStore';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Inbox,
  HelpCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, isLoading } = useComplaintStore();

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Compute metrics
  const totalCount = complaints.length;
  const inProgressCount = complaints.filter(
    (c) => c.status === 'in_progress' || c.status === 'assigned' || c.status === 'under_review'
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === 'resolved' || c.status === 'closed'
  ).length;
  const criticalCount = complaints.filter(
    (c) => c.priority === 'critical' || c.priority === 'high'
  ).length;

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

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="space-y-8 transition-colors duration-200">
        
        {/* Welcome Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-50/70 via-white to-indigo-50/50 border border-brand-100 shadow-sm dark:from-slate-900 dark:via-brand-950/40 dark:to-slate-900 dark:border-slate-800 dark:shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              Student Grievance Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Department: {user?.department || 'General'} • ID: {user?.studentId || 'N/A'}
            </p>
          </div>

          <NextLink
            href="/complaints/new"
            className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-brand-600/25 transition-all shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>File New Complaint</span>
          </NextLink>
          <NextLink
            href="/help"
            className="ml-3 px-5 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm flex items-center gap-2 transition-all shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help Center</span>
          </NextLink>
        </div>

        {/* MetricGrid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-none space-y-2 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Total Filed</span>
              <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalCount}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Cumulative logged tickets</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-none space-y-2 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Active & In Progress</span>
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">{inProgressCount}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Currently being investigated</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-none space-y-2 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Ready for feedback review</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-none space-y-2 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">High / Urgent</span>
              <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{criticalCount}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">High priority escalation</p>
          </div>
        </div>

        {/* Complaints Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Your Submitted Complaints</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing {complaints.length} tickets
            </span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Retrieving your complaint records...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none text-center space-y-3 transition-colors">
              <Inbox className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-base font-semibold text-slate-800 dark:text-slate-300">No complaints registered yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Have an issue with Wi-Fi, electricity, cleanliness, or academic facilities? Report it now.
              </p>
              <NextLink
                href="/complaints/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-medium text-white transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Submit First Grievance
              </NextLink>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {complaints.map((c) => (
                <NextLink
                  key={c._id}
                  href={`/complaints/${c._id}`}
                  className="p-5 rounded-2xl bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-slate-300 shadow-sm dark:bg-slate-900/70 dark:hover:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 dark:shadow-none transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadge(c.status)}`}>
                          {c.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getPriorityBadge(c.priority)}`}>
                          {c.priority}
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                          {c.category}
                        </span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors shrink-0" />
                    </div>

                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span>📍 {c.location}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </NextLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
