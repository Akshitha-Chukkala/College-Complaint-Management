import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import NextLink from 'next/link';
import { ArrowLeft, Clock, Loader2, Star, StarHalf } from 'lucide-react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';

  // Helper to build full URL for an attachment
  const getAttachmentUrl = (path) => {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith('/') ? path : `/${path}`;
    const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || '';
    return `${base}${normalized}`;
  };

export default function StudentComplaintDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [complaint, setComplaint] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ rating: '', comment: '' });
  const [modalImg, setModalImg] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load complaint data
  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/complaints/${id}`);
      setComplaint(data.data);
      setTimeline(data.timeline);
    } catch (err) {
      console.error('Failed loading complaint', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    if (id) {
      const socket = getSocket();
      socket.emit('join_complaint_room', id);
      socket.on('complaintUpdated', (data) => {
        if (data.id === id) {
          fetchDetail();
        }
      });
      return () => {
        socket.off('complaintUpdated');
      };
    }
  }, [id]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.rating) {
      setErrorMsg('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/complaints/${id}/feedback`, {
        rating: Number(feedback.rating),
        feedback: feedback.comment,
      });
      // Refresh data to reflect closed status
      await fetchDetail();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
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
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <NextLink href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
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

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 text-xs mb-4">
              <span className="px-2 py-1 bg-brand-50 text-brand-800 rounded">{complaint.category}</span>
              <span className="px-2 py-1 bg-amber-50 text-amber-800 rounded">{complaint.priority}</span>
              <span className={`px-2 py-1 rounded ${
                complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                complaint.status === 'open' ? 'bg-rose-100 text-rose-800' : 'bg-gray-100 text-gray-800'
              }`}>Status: {complaint.status.replace('_', ' ')}</span>
            </div>

            {/* Attachments */}
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

            {/* Timeline */}
            <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
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

            {/* Feedback form – shown when complaint is resolved */}
            {complaint.status === 'resolved' && (
              <div className="mt-6 border-t border-slate-200 dark:border-slate-700 pt-4">
                <h3 className="text-lg font-semibold mb-2">Provide Feedback</h3>
                {errorMsg && <p className="text-rose-600 mb-2">{errorMsg}</p>}
                <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                  <label className="block text-sm font-medium">Rating (1‑5)</label>
                  <select
                    required
                    value={feedback.rating}
                    onChange={(e) => setFeedback({ ...feedback, rating: e.target.value })}
                    className="input w-full"
                  >
                    <option value="">Select rating</option>
                    {[1,2,3,4,5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>

                  <label className="block text-sm font-medium">Additional comments (optional)</label>
                  <textarea
                    rows={3}
                    value={feedback.comment}
                    onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    className="input w-full"
                    placeholder="What did you think of the resolution?"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            )}

            {/* Show rating after feedback submitted */}
            {complaint.rating && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Your Rating</h4>
                {renderStars(complaint.rating)}
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
