import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import NextLink from 'next/link';
import { ArrowLeft, HelpCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function HelpPage() {
  const { user } = useAuthStore();
  const faqs = [
    {
      q: 'How do I submit a new complaint?',
      a: 'Click the "File New Complaint" button on the dashboard, fill in the details, attach any images, and submit. Your complaint will appear in your list and be processed by staff.'
    },
    {
      q: 'What happens after I submit a complaint?',
      a: 'Your complaint goes through a status lifecycle: Submitted → Under Review → Assigned → In Progress → Resolved → Closed. You can track the progress in the Timeline section of each complaint.'
    },
    {
      q: 'How can I give feedback?',
      a: 'When a complaint reaches the \"Resolved\" status, a feedback form appears. Rate the resolution (1‑5) and optionally leave comments.'
    },
    {
      q: 'Who can see my feedback?',
      a: 'Your rating and comments are visible only to administrators handling the ticket, helping them improve future resolutions.'
    },
    {
      q: 'I need help with my account?',
      a: 'Visit the Settings page to update your profile, password, or contact support.'
    }
  ];

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <NextLink href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </NextLink>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Help Center</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Below are the most common questions and answers to help you navigate the Campus Resolve system.</p>
        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div key={idx} className="p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-brand-600" />
                {item.q}
              </h3>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
