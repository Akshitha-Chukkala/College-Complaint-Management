import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { useComplaintStore } from '../../store/complaintStore';
import { useThemeStore } from '../../store/themeStore';
import { getSocket, joinUserRoom } from '../../services/socket';
import {
  ShieldAlert,
  Bell,
  LogOut,
  User,
  PlusCircle,
  LayoutDashboard,
  ShieldCheck,
  Settings,
  X,
  Menu,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';

export default function AppShell({ children }) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications, unreadNotificationsCount, fetchNotifications, markNotificationAsRead, addNotification } = useComplaintStore();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Setup Socket.IO real-time notification listener
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      joinUserRoom(user._id);
      fetchNotifications();

      const socket = getSocket();
      if (socket) {
        const handleNewNotification = (notif) => {
          addNotification(notif);
        };
        socket.on('notification', handleNewNotification);
        socket.on('status_update', (data) => {
          addNotification({
            _id: `temp-${Date.now()}`,
            title: `Complaint Updated: #${data.complaintId?.slice(-6) || 'TICKET'}`,
            message: `Status changed to ${data.newStatus.toUpperCase().replace('_', ' ')}`,
            createdAt: new Date().toISOString(),
            isRead: false
          });
        });

        return () => {
          socket.off('notification', handleNewNotification);
          socket.off('status_update');
        };
      }
    }
  }, [isAuthenticated, user?._id]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <NextLink href="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                    Campus<span className="text-brand-600 dark:text-brand-400">Resolve</span>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider block -mt-1">
                    College Grievance Portal
                  </span>
                </div>
              </NextLink>

              {/* Role badge */}
              {isAuthenticated && user && (
                <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isAdmin 
                    ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700/50' 
                    : 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-900/50 dark:text-brand-300 dark:border-brand-700/50'
                }`}>
                  {user.role}
                </span>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {isAuthenticated ? (
                <>
                  <NextLink
                    href={isAdmin ? "/admin/dashboard" : "/dashboard"}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      router.pathname === '/dashboard' || router.pathname === '/admin/dashboard'
                        ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Dashboard</span>
                  </NextLink>

                  {!isAdmin && (
                    <NextLink
                      href="/complaints/new"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        router.pathname === '/complaints/new'
                          ? 'bg-brand-600 text-white shadow-sm'
                          : 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-600 hover:text-white dark:bg-brand-600/20 dark:text-brand-300 dark:border-brand-500/30 dark:hover:bg-brand-600 dark:hover:text-white'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Report Issue</span>
                    </NextLink>
                  )}

                  {isAdmin && (
                    <NextLink
                      href="/admin/dashboard"
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        router.pathname.startsWith('/admin')
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-600 hover:text-white dark:bg-purple-600/20 dark:text-purple-300 dark:border-purple-500/30 dark:hover:bg-purple-600 dark:hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin Triage</span>
                    </NextLink>
                  )}

                  <NextLink
                    href="/settings"
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      router.pathname === '/settings'
                        ? 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white'
                    }`}
                  >
                    <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    <span>Settings</span>
                  </NextLink>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <NextLink
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800/60 rounded-lg transition-colors"
                  >
                    Sign In
                  </NextLink>
                  <NextLink
                    href="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-500 rounded-lg shadow-sm transition-colors"
                  >
                    Student Registration
                  </NextLink>
                </div>
              )}
            </nav>

            {/* Right Side Icons & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-600" />
                )}
              </button>

              {isAuthenticated && (
                <>
                  {/* Notification Bell */}
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none transition-colors"
                    aria-label="View notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </button>

                  {/* User Profile Pill & Logout */}
                  <div className="hidden sm:flex items-center pl-2 border-l border-slate-200 dark:border-slate-800 space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="text-left text-xs hidden lg:block">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{user?.name}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{user?.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-slate-800/60 transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-4 space-y-2 shadow-lg transition-colors">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-slate-800 dark:text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                  </button>
                </div>

                <NextLink
                  href={isAdmin ? "/admin/dashboard" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 py-2 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>Dashboard</span>
                </NextLink>

                {!isAdmin && (
                  <NextLink
                    href="/complaints/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 px-3 rounded-lg text-brand-700 bg-brand-50 border border-brand-200 dark:text-brand-300 dark:bg-brand-900/30 dark:border-brand-800/50"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Report Issue</span>
                  </NextLink>
                )}

                {isAdmin && (
                  <NextLink
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 px-3 rounded-lg text-purple-700 bg-purple-50 dark:text-purple-300 dark:bg-purple-900/30"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Triage</span>
                  </NextLink>
                )}

                <NextLink
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 py-2 px-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Settings</span>
                </NextLink>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center space-x-2 py-2 px-3 rounded-lg text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <NextLink
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2 px-4 rounded-lg bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-medium"
                >
                  Sign In
                </NextLink>
                <NextLink
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center w-full py-2 px-4 rounded-lg bg-brand-600 text-white font-medium"
                >
                  Student Registration
                </NextLink>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Slide-over Notification Drawer */}
      {notificationOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setNotificationOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col dark:bg-slate-900 dark:border-slate-800 transition-colors">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base">Live Activity Feed</h3>
                </div>
                <button
                  onClick={() => setNotificationOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Notification Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-slate-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Real-time ticket updates will appear here.</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => !n.isRead && markNotificationAsRead(n._id)}
                      className={`p-3 rounded-xl border text-sm transition-all cursor-pointer ${
                        n.isRead
                          ? 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-900/60 dark:border-slate-800/80 dark:text-slate-400'
                          : 'bg-brand-50/60 border-brand-200 text-slate-800 dark:bg-brand-950/40 dark:border-brand-700/50 dark:text-slate-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">{n.title}</p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2">
                        {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white text-slate-500 dark:border-slate-900 dark:bg-slate-950 dark:text-slate-500 py-6 text-center text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CampusResolve. Official College Complaint Management System.</p>
          <p className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Operational Console Active
          </p>
        </div>
      </footer>
    </div>
  );
}
