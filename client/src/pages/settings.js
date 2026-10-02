import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { User, Shield, Key, Bell, Sun, Moon, LogOut, Palette } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto space-y-6 transition-colors duration-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Account & System Settings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your campus profile, credentials, appearance, and notification preferences</p>
        </div>

        {/* Profile Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none space-y-6 transition-colors">
          <div className="flex items-center space-x-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
              <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/80 space-y-1 transition-colors">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Department</span>
              <p className="text-slate-800 dark:text-white font-semibold">{user?.department || 'General Campus'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/80 space-y-1 transition-colors">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Student / Employee ID</span>
              <p className="text-slate-800 dark:text-white font-semibold">{user?.studentId || 'N/A'}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/80 space-y-1 transition-colors">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Security Authority</span>
              <p className="text-slate-800 dark:text-white font-semibold">JWT Bearer (Bcrypt Cost 12)</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/80 space-y-1 transition-colors">
              <span className="text-slate-400 dark:text-slate-500 font-medium">System Status</span>
              <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Verified Session
              </p>
            </div>
          </div>
        </div>

        {/* Appearance & Theme Settings */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none space-y-4 transition-colors">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Appearance & Interface Theme
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your preferred interface theme. Changes persist across sessions.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                theme === 'light'
                  ? 'border-brand-600 bg-brand-50/60 text-brand-900 ring-2 ring-brand-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Light Theme</p>
                <p className="text-[10px] text-slate-500">Clean, crisp & high contrast</p>
              </div>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                theme === 'dark'
                  ? 'border-brand-500 bg-brand-950/40 text-brand-200 ring-2 ring-brand-500/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 shadow-sm flex items-center justify-center text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold">Dark Theme</p>
                <p className="text-[10px] text-slate-500">Sleek operator console mode</p>
              </div>
            </button>
          </div>
        </div>

        {/* Security & Controls */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none space-y-4 transition-colors">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Security & Controls
          </h3>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/80 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">Password Authentication</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Encrypted with industry standard salt rounds</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-transparent dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium transition-colors shadow-sm">
              Update Password
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800/80 transition-colors">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">Real-Time WebSockets</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Receive live push notifications on ticket status transitions</p>
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Enabled</span>
          </div>
        </div>

        {/* Sign out button */}
        <div className="pt-2">
          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full py-3 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:border-rose-800/60 dark:text-rose-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of CampusResolve</span>
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
