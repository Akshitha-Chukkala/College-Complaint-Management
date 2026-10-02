import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized roles to their respective dashboards
        if (user.role === 'admin' || user.role === 'staff') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/dashboard');
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-sm font-medium tracking-wide">Authenticating CampusResolve session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <p className="text-rose-400 font-semibold mb-2">Access Restricted</p>
        <p className="text-sm">You do not have administrative clearance for this console.</p>
      </div>
    );
  }

  return children;
}
