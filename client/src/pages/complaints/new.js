import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import FileUploader from '../../components/FileUploader/FileUploader';
import api from '../../services/api';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Building,
  MapPin,
  Flag,
  FileText,
  HelpCircle,
  Lightbulb
} from 'lucide-react';

export default function NewComplaintPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    category: 'auto', // 'auto' triggers AI inference or student can select
    location: '',
    priority: 'medium',
    description: '',
    attachments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Live AI Prediction Preview state
  const [aiPreview, setAiPreview] = useState(null);
  const [isAiPredicting, setIsAiPredicting] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Live AI Triage typing effect
  useEffect(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const hasEnoughText = formData.title.trim().length > 3 || formData.description.trim().length > 8;

    if (hasEnoughText) {
      setIsAiPredicting(true);
      typingTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await api.post('/complaints/ai-preview', {
            title: formData.title,
            description: formData.description
          });
          if (res.data?.success && res.data?.data) {
            setAiPreview(res.data.data);
          }
        } catch (err) {
          console.warn('AI preview request failed:', err.message);
        } finally {
          setIsAiPredicting(false);
        }
      }, 500); // 500ms debounce
    } else {
      setAiPreview(null);
      setIsAiPredicting(false);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [formData.title, formData.description]);

  const handleChange = (e) => {
    if (errorMessage) setErrorMessage('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAttachmentsChange = (urls) => {
    setFormData({ ...formData, attachments: urls });
  };

  const handleApplyAiSuggestion = () => {
    if (aiPreview) {
      setFormData((prev) => ({
        ...prev,
        category: aiPreview.category || prev.category,
        priority: aiPreview.priority || prev.priority
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage('Please provide a complaint title');
      return;
    }
    if (!formData.location.trim()) {
      setErrorMessage('Please specify the campus location');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Please provide a detailed description of the issue');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        title: formData.title.trim(),
        location: formData.location.trim(),
        category: formData.category === 'auto' ? (aiPreview?.category || 'other') : formData.category,
        priority: formData.priority,
        description: formData.description.trim(),
        attachments: formData.attachments
      };

      const res = await api.post('/complaints', payload);
      if (res.data?.success && res.data?.data?._id) {
        router.push(`/complaints/${res.data.data._id}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Failed to submit complaint. Please check your inputs.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="max-w-3xl mx-auto space-y-6 transition-colors duration-200">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <NextLink
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </NextLink>

          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Assisted Ticket Filing
          </span>
        </div>

        {/* Header Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50/70 via-white to-indigo-50/50 border border-brand-100 shadow-sm dark:from-slate-900 dark:via-brand-950/40 dark:to-slate-900 dark:border-slate-800 dark:shadow-none space-y-1 transition-colors">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Report a Campus Grievance
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Fill out the details below. Our triage engine will automatically inspect and route your ticket to the responsible department.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live AI Preview Card */}
        {(aiPreview || isAiPredicting) && (
          <div className="p-4 rounded-2xl border border-brand-200 bg-brand-50/70 text-slate-800 dark:border-brand-800/60 dark:bg-brand-950/40 dark:text-slate-200 space-y-2 shadow-sm transition-all animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-brand-700 dark:text-brand-300">
                <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                <span>Live AI Triage Prediction</span>
                {isAiPredicting && (
                  <Loader2 className="w-3 h-3 animate-spin text-brand-500 ml-1" />
                )}
              </div>

              {aiPreview && formData.category === 'auto' && (
                <button
                  type="button"
                  onClick={handleApplyAiSuggestion}
                  className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/60 hover:bg-brand-200 dark:hover:bg-brand-800/80 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Lightbulb className="w-3 h-3" />
                  <span>Lock In AI Suggestions</span>
                </button>
              )}
            </div>

            {aiPreview && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-brand-100 dark:border-brand-900/50">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase block">Inferred Category</span>
                  <span className="font-bold text-slate-800 dark:text-white capitalize">
                    {aiPreview.category}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-brand-100 dark:border-brand-900/50">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase block">Urgency Priority</span>
                  <span className="font-bold text-slate-800 dark:text-white capitalize">
                    {aiPreview.priority}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-brand-100 dark:border-brand-900/50">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase block">Auto Summary</span>
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-1">
                    {aiPreview.aiSummary}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none space-y-6 transition-colors">
          
          {/* Issue Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Complaint Title *
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.title.length}/150
              </span>
            </div>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="title"
                required
                maxLength={150}
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Wi-Fi router offline in 3rd floor library hall"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          {/* Location & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Campus Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Campus Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Hostel B, Room 204 or Block 4 Lab 2"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            {/* Department Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Department Category
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white transition-colors"
                >
                  <option value="auto">✨ Auto-Detect via AI Engine</option>
                  <option value="wifi">Wi-Fi & IT</option>
                  <option value="hostel">Hostels</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="academics">Academics</option>
                  <option value="cleanliness">Cleanliness</option>
                  <option value="other">Other Campus Services</option>
                </select>
              </div>
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Urgency / Priority Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'low', label: 'Low', desc: 'Minor / Cosmetic' },
                { id: 'medium', label: 'Medium', desc: 'Standard issue' },
                { id: 'high', label: 'High', desc: 'Disrupts daily activity' },
                { id: 'critical', label: 'Critical', desc: 'Hazard or emergency' }
              ].map((p) => {
                const isSelected = formData.priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p.id })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/70 text-brand-900 ring-2 ring-brand-500/20 dark:border-brand-500 dark:bg-brand-950/40 dark:text-brand-300'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'
                    }`}
                  >
                    <p className="text-xs font-bold capitalize">{p.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Detailed Description *
            </label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide specific details about the issue: when it started, equipment numbers, symptoms, or affected people..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Image Attachments Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Evidence Attachments (Optional)
            </label>
            <FileUploader
              attachments={formData.attachments}
              onAttachmentsChange={handleAttachmentsChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <NextLink
              href="/dashboard"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 text-xs font-semibold text-center transition-colors"
            >
              Cancel
            </NextLink>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting & Triaging...</span>
                </>
              ) : (
                <>
                  <span>Submit Grievance</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
