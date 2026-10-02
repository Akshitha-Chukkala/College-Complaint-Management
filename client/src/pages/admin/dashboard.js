import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import {
  ShieldAlert,
  BarChart3,
  Filter,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Search,
  Layers
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { complaints, fetchComplaints, isLoading } = useComplaintStore();

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

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
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <div className="space-y-8 transition-colors duration-200">
        
        {/* Admin Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-slate-50 border border-purple-200 shadow-sm dark:from-purple-950/60 dark:via-slate-900 dark:to-slate-900 dark:border-purple-800/40 dark:shadow-none flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              Campus Administration Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Administrative Triage Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Welcome, {user?.name} ({user?.department || 'Administration'}) • Role: {user?.role?.toUpperCase()}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Dispatch Stream Active
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-none space-y-1.5 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Total Campus Tickets</span>
              <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{complaints.length}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Across all 5 departments</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-none space-y-1.5 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Pending Assignment</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {complaints.filter((c) => c.status === 'submitted' || c.status === 'under_review').length}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Requires triage review</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-none space-y-1.5 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Critical Escalations</span>
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {complaints.filter((c) => c.priority === 'critical').length}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">SLA priority threshold</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/70 dark:border-slate-800/80 dark:shadow-none space-y-1.5 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="text-xs font-medium uppercase tracking-wider">Resolution Rate</span>
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {complaints.length > 0
                ? `${Math.round((complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length / complaints.length) * 100)}%`
                : '100%'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Efficiency benchmark</p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none flex flex-col md:flex-row items-center justify-between gap-4 transition-colors">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search title or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 focus:outline-none focus:border-purple-600 transition-colors"
            >
              <option value="all">All Categories</option>
              <option value="wifi">Wi-Fi & IT</option>
              <option value="hostel">Hostels</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="academics">Academics</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 focus:outline-none focus:border-purple-600 transition-colors"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Complaints Table/Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Active Campus Grievance Queue</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredComplaints.length} tickets
            </span>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/40 dark:border-slate-800 dark:shadow-none text-slate-400 dark:text-slate-500 transition-colors">
              <CheckCircle className="w-10 h-10 mx-auto text-emerald-500/50 mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching complaints in queue</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">All issues have been triaged or filters yield zero results.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComplaints.map((c) => (
                <div
                  key={c._id}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm dark:bg-slate-900/70 dark:border-slate-800 dark:hover:border-slate-700 dark:shadow-none transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getStatusBadge(c.status)}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${getPriorityBadge(c.priority)}`}>
                        {c.priority}
                      </span>
                      <span className="text-[10px] text-purple-700 bg-purple-50 border border-purple-200 dark:text-purple-300 dark:bg-purple-950/50 dark:border-purple-800/40 px-2 py-0.5 rounded capitalize">
                        {c.category}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                      {c.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">
                      {c.description}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                      <span>📍 {c.location}</span>
                      <span>Filed: {new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <NextLink
                    href={`/admin/complaints/${c._id}`}
                    className="w-full md:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm"
                  >
                    <span>Manage Ticket</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NextLink>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
