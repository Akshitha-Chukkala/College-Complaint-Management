import { useEffect } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useAuthStore } from '../store/authStore';
import {
  ShieldAlert,
  ArrowRight,
  Wifi,
  Home,
  Building2,
  Sparkles,
  Clock,
  CheckCircle,
  FileText,
  Users
} from 'lucide-react';

export default function HomeLanding() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'admin' || user.role === 'staff') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="space-y-16 py-6 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white via-indigo-50/30 to-slate-100 border border-slate-200 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 dark:border-slate-800 p-8 sm:p-14 text-center shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            Next-Gen AI-Powered Grievance Redressal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Transparent Campus Issue Resolution, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-600 dark:from-brand-400 dark:via-indigo-300 dark:to-cyan-400">
              Resolved in Real-Time.
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Report issues regarding hostels, Wi-Fi, classroom infrastructure, and hygiene.
            Powered by smart AI auto-triage and live status timeline streaming.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <NextLink
              href="/register"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/25 transition-all"
            >
              <span>Get Started (Student)</span>
              <ArrowRight className="w-4 h-4" />
            </NextLink>

            <NextLink
              href="/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-300 shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 dark:shadow-none transition-all text-center"
            >
              Portal Login
            </NextLink>
          </div>
        </div>
      </section>

      {/* Quick Guide: How it works */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">How CampusResolve Operates</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">From submission to verification in four structured stages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">File Grievance</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Describe the problem, attach evidence photos, and specify your campus location.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 dark:bg-brand-500/10 dark:border-brand-500/20 dark:text-brand-400 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">AI Auto-Triage</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              AI analyzes complaint sentiment and categorizes priority, routing directly to relevant staff.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-400 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Live Tracking</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive instant Socket.IO notifications as administrators dispatch field personnel.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/60 dark:border-slate-800 dark:shadow-none space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Rate & Close</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Review official resolution notes and provide satisfaction feedback score once resolved.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Categories */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Covered Campus Domains</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">All college departments integrated into a unified portal.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { icon: Wifi, name: 'Wi-Fi & IT', count: '100% Monitored' },
            { icon: Home, name: 'Hostels', count: '24/7 Redressal' },
            { icon: Building2, name: 'Infrastructure', count: 'Civil & Elec' },
            { icon: FileText, name: 'Academics', count: 'Dean Office' },
            { icon: Users, name: 'Cleanliness', count: 'Sanitation' },
            { icon: Clock, name: 'Fast SLA', count: '<24h Response' }
          ].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm dark:bg-slate-900/50 dark:border-slate-800 dark:shadow-none text-center space-y-2 hover:border-brand-300 dark:hover:border-slate-700 transition-colors">
              <item.icon className="w-6 h-6 text-brand-600 dark:text-brand-400 mx-auto" />
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{item.name}</p>
              <p className="text-[10px] text-slate-500">{item.count}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
