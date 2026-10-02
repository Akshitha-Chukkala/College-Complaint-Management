import { useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert, LogIn, Lock, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    if (error) clearError();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData.email, formData.password);
    if (result.success) {
      if (result.user.role === 'admin' || result.user.role === 'staff') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'admin') {
      setFormData({
        email: 'admin@campusresolve.edu',
        password: 'Admin@123'
      });
    } else {
      setFormData({
        email: 'student@campusresolve.edu',
        password: 'Student@123'
      });
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-8 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-2xl backdrop-blur-xl transition-colors duration-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 dark:bg-brand-600/20 dark:border-brand-500/30 dark:text-brand-400 flex items-center justify-center mx-auto">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">CampusResolve Portal</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your student or administrative account</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800/80 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              College Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rollnumber@college.edu"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <LogIn className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credential Fillers */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-2 flex items-center gap-1">
            <KeyRound className="w-3 h-3 text-brand-600 dark:text-brand-400" />
            Quick Demo Fill:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('student')}
              className="py-1.5 px-2.5 text-[11px] font-medium rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:border-slate-700/60 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Fill Student Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="py-1.5 px-2.5 text-[11px] font-medium rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 dark:border-purple-800/50 dark:text-purple-300 dark:hover:text-white transition-colors"
            >
              Fill Admin Demo
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          New to CampusResolve?{' '}
          <NextLink href="/register" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">
            Register here
          </NextLink>
        </div>
      </div>
    </div>
  );
}
