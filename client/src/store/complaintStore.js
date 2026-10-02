import { create } from 'zustand';
import api from '../services/api';

export const useComplaintStore = create((set, get) => ({
  complaints: [],
  currentComplaint: null,
  notifications: [],
  unreadNotificationsCount: 0,
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    status: 'all',
    priority: 'all',
    search: '',
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  fetchComplaints: async (query = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { filters } = get();
      const params = {
        ...filters,
        ...query,
      };
      // Clean 'all' filter parameters
      if (params.category === 'all') delete params.category;
      if (params.status === 'all') delete params.status;
      if (params.priority === 'all') delete params.priority;

      const res = await api.get('/complaints', { params });
      set({
        complaints: res.data?.data || [],
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch complaints',
        isLoading: false,
      });
    }
  },

  fetchComplaintById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/complaints/${id}`);
      set({
        currentComplaint: res.data?.data || null,
        isLoading: false,
      });
      return res.data?.data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch complaint details',
        isLoading: false,
      });
      return null;
    }
  },

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotificationsCount: state.unreadNotificationsCount + 1,
    }));
  },

  fetchNotifications: async () => {
    try {
      const res = await api.get('/notifications');
      const list = res.data?.data || [];
      const unreadCount = list.filter((n) => !n.isRead).length;
      set({ notifications: list, unreadNotificationsCount: unreadCount });
    } catch (e) {
      console.warn('Failed to load notifications:', e.message);
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        ),
        unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
      }));
    } catch (e) {
      console.warn('Failed to mark notification read:', e.message);
    }
  },
}));
