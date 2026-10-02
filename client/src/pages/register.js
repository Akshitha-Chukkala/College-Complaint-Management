import { useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useAuthStore } from '../store/authStore';
import { UserPlus, User, Mail, Lock, AlertCircle, Loader2, Hash } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    if (error) clearError();
    if (formError) setFormError('');
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters');
      return;
    }

    const result = await register({
      name: formData.name,
      email: formData.email,
      studentId: formData.studentId,
      department: formData.department,
      password: formData.password
    });

    if (result.success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-md w-full space-y-6 bg-white border border-slate-200 p-8 rounded-3xl shadow-xl dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-2xl backdrop-blur-xl transition-colors duration-200">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 dark:bg-brand-600/20 dark:border-brand-500/30 dark:text-brand-400 flex items-center justify-center mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Student Registration</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Create an official campus account to report & track issues</p>
        </div>

        {/* Error Alert */}
        {(error || formError) && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:border-rose-800/80 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

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
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Student ID
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="STU-2026-001"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Department
              </label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white transition-colors"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical Eng">Electrical Eng</option>
                  <option value="Mechanical Eng">Mechanical Eng</option>
                  <option value="Civil Eng">Civil Eng</option>
                  <option value="Management">Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 chars"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Confirm
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Match password"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand-600 dark:bg-slate-950 dark:border-slate-800 dark:text-white dark:placeholder-slate-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <UserPlus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
          Already registered?{' '}
          <NextLink href="/login" className="text-brand-600 dark:text-brand-400 hover:underline font-semibold">
            Sign in
          </NextLink>
        </div>
      </div>
    </div>
  );
}
