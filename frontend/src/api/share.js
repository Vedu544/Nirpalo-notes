import api from './axios.js';

export const shareAPI = {
  // Create shareable link for note
  createLink: async (noteId) => {
    return await api.post('/share/create', { noteId });
  },

  // Get note by share token (public access)
  getByToken: async (token) => {
    return await api.get(`/share/${token}`);
  },

  // Get all share links for user's notes
  getUserLinks: async () => {
    return await api.get('/share/links');
  },

  // Delete share link
  deleteLink: async (shareId) => {
    return await api.delete(`/share/${shareId}`);
  },

  // Update share link settings
  updateLink: async (shareId, settings) => {
    return await api.put(`/share/${shareId}`, settings);
  },

  // Get share link analytics
  getLinkStats: async (shareId) => {
    return await api.get(`/share/${shareId}/stats`);
  },
};
