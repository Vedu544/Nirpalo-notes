import api from './axios.js';

export const shareAPI = {
  // Get all users (except current user) for sharing
  getAllUsers: async () => {
    return await api.get('/share/users/all');
  },

  // Share a note with a user
  shareNote: async (noteId, sharedWithUserId, permission = 'VIEWER') => {
    return await api.post(`/share/${noteId}`, {
      sharedWithUserId,
      permission
    });
  },

  // Get all notes shared with current user
  getSharedNotes: async () => {
    return await api.get('/share/shared-with-me');
  },

  // Get all collaborators of a note
  getCollaborators: async (noteId) => {
    return await api.get(`/share/${noteId}/collaborators`);
  },

  // Remove a collaborator from a note
  removeCollaborator: async (noteId, userId) => {
    return await api.delete(`/share/${noteId}/collaborator/${userId}`);
  },

  // Update collaborator permission
  updatePermission: async (noteId, userId, permission) => {
    return await api.patch(`/share/${noteId}/collaborator/${userId}`, {
      permission
    });
  },

  // Get public note by share token (NO authentication)
  getPublicNote: async (token) => {
    return await api.get(`/share/public/${token}`);
  }
};