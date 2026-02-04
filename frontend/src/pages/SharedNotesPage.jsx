import React, { useState, useEffect } from 'react';
import { Users, FileText, Edit, Trash2, Share2, X } from 'lucide-react';
import { shareAPI } from '../api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const SharedNotesPage = () => {
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Dialog States
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSharedNotes();
  }, []);

  const fetchSharedNotes = async () => {
    try {
      setLoading(true);
      const response = await shareAPI.getSharedNotes();
      // Transform the nested note structure into a flat structure
      const transformedNotes = (response.data || []).map(item => ({
        id: item.note.id,
        title: item.note.title,
        content: item.note.content || '',
        updatedAt: item.note.updatedAt,
        owner: item.note.owner,
        permission: item.permission,
        collaboratorId: item.id // ID for removing collaboration
      }));
      setSharedNotes(transformedNotes);
    } catch (error) {
      toast.error('Failed to fetch shared notes');
      console.error('Error fetching shared notes:', error);
    } finally {
      setLoading(false);
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
      const response = await shareAPI.updateSharedNote(editingNote.id, {
        title: editingNote.title,
        content: editingNote.content
      });

      if (response.data) {
        // Update the note in the list
        setSharedNotes(sharedNotes.map(n => 
          n.id === editingNote.id 
            ? { ...n, title: response.data.title, content: response.data.content, updatedAt: response.data.updatedAt }
            : n
        ));
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
    return <LoadingSpinner text="Loading shared notes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Shared with Me</h1>
        <p className="page-subtitle">Notes that have been shared with you</p>
      </div>

      {/* Shared Notes */}
      {sharedNotes.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No shared notes yet
          </h3>
          <p className="text-secondary-600">
            When someone shares a note with you, it will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sharedNotes.map((note) => (
            <Card key={note.id} hover className="group">
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2 mb-2">
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-xs text-secondary-500">
                      <Users className="w-3 h-3" />
                      <span>Shared by {note.owner?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Show Edit button only if permission is EDITOR */}
                    {note.permission === 'EDITOR' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="p-1"
                        title="Edit note"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    
                  </div>
                </div>
                
                <p className="text-secondary-600 text-sm mb-4 line-clamp-3">
                  {note.content || 'No content'}
                </p>
                
                <div className="flex items-center justify-between text-xs text-secondary-500">
                  <span>
                    {note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : 'Unknown date'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className={`px-2 py-1 rounded text-white text-xs font-medium ${
                      note.permission === 'EDITOR' 
                        ? 'bg-primary-600' 
                        : 'bg-slate-950'
                    }`}>
                      {note.permission === 'EDITOR' ? 'Editor' : ' Viewer'}
                    </span>
                    <span>
                      {note.content?.length || 0} characters
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
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

              {/* Permission Info */}
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                <p className="text-xs text-primary-700 font-medium">
                  ✏️ You have EDITOR permission on this note
                </p>
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

export default SharedNotesPage;