import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText } from 'lucide-react';
import { notesAPI } from '../api';
import { shareAPI } from '../api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NoteViewDialog from '../components/NoteViewDialoug';
import CreateNoteDialog from '../components/dashboard/CreateNoteDialog';
import EditNoteDialog from '../components/dashboard/EditNoteDialog';
import ShareNoteDialog from '../components/dashboard/ShareNoteDialog';
import NoteCard from '../components/dashboard/Note';

const DashboardPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);

  // Dialog states
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  // Form states
  const [createFormData, setCreateFormData] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState(null);
  const [sharingNote, setSharingNote] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState('VIEWER');

  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    setFilteredNotes(
      searchQuery
        ? notes.filter(note =>
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.content.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : notes
    );
  }, [searchQuery, notes]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getAll();
      setNotes(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch notes');
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // View handlers
  const handleViewNote = (note) => {
    setViewingNote(note);
    setShowViewDialog(true);
  };

  // Create handlers
  const handleCreateNote = async () => {
    if (!createFormData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    try {
      setIsCreating(true);
      const response = await notesAPI.create(createFormData);
      if (response.data) {
        setNotes([response.data, ...notes]);
        toast.success('Note created successfully');
        setShowCreateDialog(false);
        setCreateFormData({ title: '', content: '' });
      }
    } catch (error) {
      toast.error('Failed to create note');
    } finally {
      setIsCreating(false);
    }
  };

  // Edit handlers
  const handleEditNote = (note, e) => {
    e.stopPropagation();
    setEditingNote({ ...note });
    setShowEditDialog(true);
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
        setNotes(notes.map(n => n.id === editingNote.id ? response.data : n));
        toast.success('Note updated successfully');
        setShowEditDialog(false);
      }
    } catch (error) {
      const message = error.response?.status === 403
        ? "You don't have permission to edit this note"
        : 'Failed to update note';
      toast.error(message);
    } finally {
      setIsEditing(false);
    }
  };

  // Delete handler
  const handleDeleteNote = async (noteId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await notesAPI.delete(noteId);
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success('Note deleted successfully');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  // Share handlers
  const handleGetShareLink = async (noteId, e) => {
    e.stopPropagation();
    try {
      const response = await shareAPI.generateShareLink(noteId);
      if (response.data?.shareUrl) {
        await navigator.clipboard.writeText(response.data.shareUrl);
        toast.success('Public share link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const handleOpenShareDialog = async (note, e) => {
    e.stopPropagation();
    setSharingNote(note);
    setSelectedUser(null);
    setSelectedPermission('VIEWER');
    setShowShareDialog(true);
    
    try {
      setIsLoadingUsers(true);
      const response = await shareAPI.getAllUsers();
      setAllUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to load users');
      setShowShareDialog(false);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleShareNote = async () => {
    if (!selectedUser) {
      toast.error('Please select a user');
      return;
    }
    try {
      setIsSharing(true);
      await shareAPI.shareNote(sharingNote.id, selectedUser.id, selectedPermission);
      toast.success(`Note shared with ${selectedUser.name}!`);
      setShowShareDialog(false);
    } catch (error) {
      const message = error.response?.status === 400
        ? '⚠️ This note is already shared with that person'
        : 'Failed to share note';
      toast.error(message);
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your notes..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">My Notes</h1>
        <p className="page-subtitle">Manage and organize your notes</p>
      </div>

      {/* Search and Create */}
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
          onClick={() => setShowCreateDialog(true)}
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
            <Button onClick={() => setShowCreateDialog(true)} icon={Plus} iconPosition="left">
              Create Note
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onView={handleViewNote}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onGetShareLink={handleGetShareLink}
              onShareWithUsers={handleOpenShareDialog}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <NoteViewDialog 
        isOpen={showViewDialog}
        onClose={() => setShowViewDialog(false)}
        note={viewingNote}
      />

      <CreateNoteDialog
        isOpen={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setCreateFormData({ title: '', content: '' });
        }}
        formData={createFormData}
        onFormChange={(e) => setCreateFormData({ ...createFormData, [e.target.name]: e.target.value })}
        onSubmit={handleCreateNote}
        isLoading={isCreating}
      />

      <EditNoteDialog
        isOpen={showEditDialog}
        note={editingNote}
        onClose={() => setShowEditDialog(false)}
        onFormChange={(e) => setEditingNote({ ...editingNote, [e.target.name]: e.target.value })}
        onSubmit={handleUpdateNote}
        isLoading={isEditing}
      />

      <ShareNoteDialog
        isOpen={showShareDialog}
        note={sharingNote}
        onClose={() => setShowShareDialog(false)}
        allUsers={allUsers}
        selectedUser={selectedUser}
        selectedPermission={selectedPermission}
        onSelectUser={setSelectedUser}
        onPermissionChange={setSelectedPermission}
        onShare={handleShareNote}
        isLoadingUsers={isLoadingUsers}
        isSharing={isSharing}
      />
    </div>
  );
};

export default DashboardPage;