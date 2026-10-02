import { useState, useRef } from 'react';
import api from '../../services/api';
import { UploadCloud, X, Image as ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react';

export default function FileUploader({ attachments = [], onAttachmentsChange }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await uploadFiles(files);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files || []);
    if (!files.length) return;
    await uploadFiles(files);
  };

  const uploadFiles = async (files) => {
    setUploadError(null);
    setIsUploading(true);

    for (const file of files) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`File "${file.name}" exceeds the 5MB maximum size limit.`);
        setIsUploading(false);
        return;
      }

      // Validate image type
      if (!file.type.startsWith('image/')) {
        setUploadError(`File "${file.name}" is not a valid image format (JPEG, PNG, WEBP allowed).`);
        setIsUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await api.post('/complaints/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (res.data?.success && res.data?.url) {
          const newUrl = res.data.url;
          onAttachmentsChange([...attachments, newUrl]);
        }
      } catch (err) {
        setUploadError(err.response?.data?.message || `Failed to upload "${file.name}".`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (indexToRemove) => {
    const updated = attachments.filter((_, idx) => idx !== indexToRemove);
    onAttachmentsChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Dropzone Container */}
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-brand-50/20 dark:bg-slate-900/40 dark:hover:bg-brand-950/20 group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {isUploading ? 'Uploading evidence photos...' : 'Click or drag & drop evidence photos here'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Supports JPEG, PNG, WEBP (Max 5MB each)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Uploaded Thumbnails Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-1">
          {attachments.map((url, idx) => {
            const apiBase = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
            const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`;

            return (
              <div
                key={idx}
                className="relative w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 group shadow-sm"
              >
                <img
                  src={fullUrl}
                  alt={`Evidence attachment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white transition-colors"
                  title="Remove attachment"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
