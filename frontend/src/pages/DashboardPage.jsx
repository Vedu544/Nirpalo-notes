import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Share2, Search, FileText, X } from 'lucide-react';
import { notesAPI } from '../api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const DashboardPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  
  // Create Dialog States
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit Dialog States
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll();
      setNotes(response.data || []);
      setFilteredNotes(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch notes');
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // ==================== DELETE HANDLERS ====================
  const handleDeleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.delete(noteId);
        setNotes(notes.filter(note => note.id !== noteId));
        toast.success('Note deleted successfully');
      } catch (error) {
        toast.error('Failed to delete note');
        console.error('Error deleting note:', error);
      }
    }
  };

  // ==================== SHARE HANDLERS ====================
  const handleShareNote = async (noteId) => {
    try {
      const shareUrl = `${window.location.origin}/share/${noteId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
      console.error('Error sharing note:', error);
    }
  };

  // ==================== CREATE HANDLERS ====================
  const handleCreateNoteClick = () => {
    setShowCreateDialog(true);
    setFormData({ title: '', content: '' });
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setFormData({ title: '', content: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateNote = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setIsCreating(true);
      const response = await notesAPI.create({
        title: formData.title,
        content: formData.content
      });

      if (response.data) {
        setNotes([response.data, ...notes]);
        toast.success('Note created successfully');
        handleCloseCreateDialog();
      }
    } catch (error) {
      toast.error('Failed to create note');
      console.error('Error creating note:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // ==================== EDIT HANDLERS ====================
  const handleEditNote = (note) => {
    setEditingNote({ ...note });
    setShowEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    setEditingNote(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditingNote(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateNote = async () => {
    if (!editingNote.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setIsEditing(true);
      const response = await notesAPI.update(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content
      });

      if (response.data) {
        // Update the note in the list
        setNotes(notes.map(n => n.id === editingNote.id ? response.data : n));
        toast.success('Note updated successfully');
        handleCloseEditDialog();
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("You don't have permission to edit this note");
      } else if (error.response?.status === 404) {
        toast.error('Note not found');
      } else {
        toast.error('Failed to update note');
      }
      console.error('Error updating note:', error);
    } finally {
      setIsEditing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your notes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Notes</h1>
        <p className="page-subtitle">Manage and organize your notes</p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10 w-full"
          />
        </div>
        
        <Button
          onClick={handleCreateNoteClick}
          icon={Plus}
          iconPosition="left"
        >
          New Note
        </Button>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-secondary-600 mb-6">
            {searchQuery 
              ? 'Try adjusting your search terms'
              : 'Create your first note to get started'
            }
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateNoteClick} icon={Plus} iconPosition="left">
              Create Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <Card key={note.id} hover className="group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditNote(note)}
                      className="p-1"
                      title="Edit note"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareNote(note.id)}
                      className="p-1"
                      title="Share note"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-error-600 hover:text-error-700"
                      title="Delete note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                  {note.content || 'No content'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-secondary-500">
                  <span>
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </span>
                  <span>
                    {note.content.length} characters
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ==================== CREATE NOTE DIALOG ==================== */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold text-secondary-900">Create New Note</h2>
              <button
                onClick={handleCloseCreateDialog}
                className="text-secondary-400 hover:text-secondary-600 transition-colors"
                disabled={isCreating}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-4">
              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter note title..."
                  value={formData.title}
                  onChange={handleFormChange}
                  className="form-input w-full"
                  autoFocus
                  disabled={isCreating}
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-secondary-700 mb-2">
                  Content
                </label>
                <textarea
                  id="content"
                  name="content"
                  placeholder="Enter note content..."
                  value={formData.content}
                  onChange={handleFormChange}
                  rows="6"
                  className="form-input w-full resize-none"
                  disabled={isCreating}
                />
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-secondary-200">
              <Button
                variant="secondary"
                onClick={handleCloseCreateDialog}
                disabled={isCreating}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNote}
                disabled={isCreating || !formData.title.trim()}
                className="flex-1"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT NOTE DIALOG ==================== */}
      {showEditDialog && editingNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-semibold text-secondary-900">Edit Note</h2>
              <button
                onClick={handleCloseEditDialog}
                className="text-secondary-400 hover:text-secondary-600 transition-colors"
                disabled={isEditing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dialog Content */}
            <div className="p-6 space-y-4">
              {/* Title Input */}
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-secondary-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  placeholder="Enter note title..."
                  value={editingNote.title}
                  onChange={handleEditFormChange}
                  className="form-input w-full"
                  disabled={isEditing}
                  autoFocus
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label htmlFor="edit-content" className="block text-sm font-medium text-secondary-700 mb-2">
                  Content
                </label>
                <textarea
                  id="edit-content"
                  name="content"
                  placeholder="Enter note content..."
                  value={editingNote.content}
                  onChange={handleEditFormChange}
                  rows="6"
                  className="form-input w-full resize-none"
                  disabled={isEditing}
                />
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex items-center gap-3 p-6 border-t border-secondary-200">
              <Button
                variant="secondary"
                onClick={handleCloseEditDialog}
                disabled={isEditing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateNote}
                disabled={isEditing || !editingNote.title.trim()}
                className="flex-1"
              >
                {isEditing ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;