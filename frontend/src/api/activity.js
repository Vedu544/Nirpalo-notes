import api from './axios.js';

export const activityAPI = {
  // Get activity logs for a specific note
  getForNote: async (noteId, page = 1, limit = 20) => {
    return await api.get(`/activity/note/${noteId}?page=${page}&limit=${limit}`);
  },

  // Get activity logs for current user
  getUserActivity: async (page = 1, limit = 20) => {
    return await api.get(`/activity/user?page=${page}&limit=${limit}`);
  },

  // Get all activity logs (admin only)
  getAll: async (page = 1, limit = 20) => {
    return await api.get(`/activity?page=${page}&limit=${limit}`);
  },

  // Get activity statistics
  getStats: async (noteId = null) => {
    const url = noteId ? `/activity/stats?noteId=${noteId}` : '/activity/stats';
    return await api.get(url);
  },
};