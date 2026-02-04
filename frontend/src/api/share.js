import api from './axios.js';

export const shareAPI = {
  // Generate a public share link for a note
  generateShareLink: async (noteId) => {
    return await api.post(`/share/${noteId}/generate-link`);
  },

  // Get all users (except current user) - SIMPLE, no noteId needed
  getAllUsers: async () => {
    return await api.get('/share/users/all');
  },

  // Share a note with a user
  // VALIDATION happens at this endpoint - checks if already shared
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

  // Update a shared note (requires EDITOR permission)
  updateSharedNote: async (noteId, noteData) => {
    return await api.put(`/note/${noteId}`, noteData);
  },

  // Get all collaborators of a note
  getCollaborators: async (noteId) => {
    return await api.get(`/share/${noteId}/collaborators`);
  },

  // Remove current user's collaboration from a note
  removeCollaboration: async (noteId, collaboratorId) => {
    return await api.delete(`/share/${noteId}/collaborator/${collaboratorId}`);
  },

  // Remove a collaborator from a note (owner only)
  removeCollaborator: async (noteId, userId) => {
    return await api.delete(`/share/${noteId}/collaborator/${userId}`);
  },

  // Update collaborator permission (owner only)
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