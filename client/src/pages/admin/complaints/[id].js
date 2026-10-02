import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute/ProtectedRoute';
import NextLink from 'next/link';
import { ArrowLeft, Clock, Loader2, CheckCircle2, XCircle, Star, StarHalf } from 'lucide-react';
import api from '../../../services/api';

// Helper to construct full URL for attachment paths
const getAttachmentUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
  return `${base}${normalized}`;
};

export default function AdminComplaintDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [modalImg, setModalImg] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Load complaint + timeline
  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.data);
      setTimeline(data.timeline);
      setNewStatus(data.data.status);
      setAssignedTo(data.data.assignedTo?.toString() || '');
      setResolutionNotes(data.data.resolutionNotes || '');
    } catch (err) {
      console.error('Failed loading complaint', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleStatusChange = async () => {
    if (!newStatus) return;
    setStatusUpdating(true);
    try {
      await api.put(`/complaints/${id}/status`, {
        status: newStatus,
        resolutionNotes,
        comment: ''
      });
      await fetchDetail();
    } catch (e) {
      console.warn('Status update failed', e);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!assignedTo) return;
    setAssigning(true);
    try {
      await api.put(`/complaints/${id}/assign`, { assignedTo });
      await fetchDetail();
    } catch (e) {
      console.warn('Assign failed', e);
    } finally {
      setAssigning(false);
    }
  };

  const handleResolutionNotesSave = async () => {
    // reuse status endpoint to persist notes without changing status
    setStatusUpdating(true);
    try {
      await api.put(`/complaints/${id}/status`, {
        status: newStatus,
        resolutionNotes,
        comment: ''
      });
      await fetchDetail();
    } catch (e) {
      console.warn('Saving notes failed', e);
    } finally {
      setStatusUpdating(false);
    }
  };

  // Helper to turn stored attachment path into a full URL for the client
  const getAttachmentUrl = (path) => {
    if (!path) return '';
    // If already absolute (http/https) return as is
    if (/^https?:\/\//i.test(path)) return path;
    // Ensure leading slash
    const normalized = path.startsWith('/') ? path : `/${path}`;
    // Remove trailing '/api' from base URL if present
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/,'') || '';
    return `${base}${normalized}`;
  };

  const renderStars = (value) => {
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    return (
      <div className="flex items-center space-x-1">
        {[...Array(full)].map((_, i) => <Star key={`full-${i}`} className="w-4 h-4 text-amber-400 fill-current" />)}
        {half && <StarHalf className="w-4 h-4 text-amber-400 fill-current" />}
      </div>
    );
  };

  return (
    <ProtectedRoute allowedRoles={['admin', 'staff']}>
      <div className="max-w-5xl mx-auto py-8 space-y-6">
        <NextLink href="/admin/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </NextLink>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
          </div>
        ) : complaint ? (
          <div className="p-8 bg-white dark:bg-slate-900/80 rounded-3xl shadow-sm transition-colors">
            <h2 className="text-2xl font-bold mb-4">{complaint.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{complaint.description}</p>

            <div className="flex flex-wrap gap-2 text-xs mb-4">
              <span className="px-2 py-1 bg-brand-50 text-brand-800 rounded">{complaint.category}</span>
              <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded">{complaint.priority}</span>
              <span className={`px-2 py-1 rounded ${
                complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                complaint.status === 'open' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-800'
              }`}>Status: {complaint.status}</span>
            </div>

            {complaint.attachments?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {complaint.attachments.map((url, idx) => (
                  <img
                    key={idx}
                    src={getAttachmentUrl(url)}
                    alt={`attachment-${idx}`}
                    className="rounded-lg object-cover w-full h-32 border border-slate-200 dark:border-slate-700 cursor-pointer"
                    onClick={() => setModalImg(getAttachmentUrl(url))}
                  />
                ))}
              </div>
            )}

            {/* Admin Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-200 dark:border-slate-700 pt-6">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium mb-1">Change Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input w-full">
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <button onClick={handleStatusChange} disabled={statusUpdating} className="mt-2 btn-primary w-full flex items-center justify-center gap-2">
                  {statusUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Update Status
                </button>
              </div>

              {/* Assignment */}
              <div>
                <label className="block text-sm font-medium mb-1">Assign to Staff (User ID)</label>
                <input type="text" placeholder="Staff user ID" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className="input w-full" />
                <button onClick={handleAssign} disabled={assigning} className="mt-2 btn-secondary w-full flex items-center justify-center gap-2">
                  {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  Assign
                </button>
              </div>
            </div>

            {/* Resolution notes */}
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
              <label className="block text-sm font-medium mb-1">Resolution Notes</label>
              <textarea rows={4} value={resolutionNotes} onChange={(e) => setResolutionNotes(e.target.value)} className="input w-full" placeholder="Add any final remarks, steps taken, or closure details" />
              <button onClick={handleResolutionNotesSave} disabled={statusUpdating} className="mt-2 btn-primary w-full flex items-center justify-center gap-2">
                {statusUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Save Notes
              </button>
            </div>

            {/* Timeline */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-3">Timeline</h3>
              <div className="space-y-3">
                {timeline.map((ev) => (
                  <div key={ev._id} className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-1 text-slate-400" />
                    <div>
                      <p className="text-sm">{ev.action}</p>
                      <p className="text-xs text-slate-500">{new Date(ev.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Feedback */}
            {complaint.rating && (
              <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="text-lg font-semibold mb-2">Student Feedback</h4>
                <p className="text-sm mb-2">Rating:</p>
                {renderStars(complaint.rating)}
                {complaint.feedback && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Comment:</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{complaint.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <p className="text-rose-600">Complaint not found.</p>
        )}
      </div>
    {modalImg && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setModalImg(null)}>
    <img src={modalImg} alt="Full view" className="max-w-full max-h-full rounded" />
  </div>
)}
</ProtectedRoute>
  );
}
