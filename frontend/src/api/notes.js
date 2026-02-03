import api from './axios.js';

export const notesAPI = {
  // Get all notes for current user
  getAll: async () => {
    return await api.get('/note');
  },

  // Get single note by ID
  getById: async (noteId) => {
    return await api.get(`/note/${noteId}`);
  },

  // Create new note
  create: async (noteData) => {
    return await api.post('/note/create', noteData);
  },

  // Update note
  update: async (noteId, noteData) => {
    return await api.put(`/note/${noteId}`, noteData);
  },

  // Delete note
  delete: async (noteId) => {
    return await api.delete(`/note/${noteId}`);
  },

  // Search notes
  search: async (query) => {
    return await api.get(`/note/search?q=${encodeURIComponent(query)}`);
  },

  // Share note with user
  shareWithUser: async (noteId, userId, permission = 'VIEWER') => {
    return await api.post('/note/share', {
      noteId,
      userId,
      permission
    });
  },

  // Get shared notes
  getShared: async () => {
    return await api.get('/note/shared');
  },

  // Get collaborators for a note
  getCollaborators: async (noteId) => {
    return await api.get(`/note/${noteId}/collaborators`);
  },

  // Remove collaborator
  removeCollaborator: async (noteId, userId) => {
    return await api.delete(`/note/${noteId}/collaborators/${userId}`);
  },

  // Update collaborator permission
  updateCollaboratorPermission: async (noteId, userId, permission) => {
    return await api.put(`/note/${noteId}/collaborators/${userId}`, {
      permission
    });
  },
};
