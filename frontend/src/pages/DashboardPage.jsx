import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Share2, Search, FileText } from 'lucide-react';
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
  const navigate = useNavigate();

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

  const handleShareNote = async (noteId) => {
    try {
      // For now, just copy the note ID to clipboard
      // In a real app, you'd implement the share API
      const shareUrl = `${window.location.origin}/share/${noteId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
      console.error('Error sharing note:', error);
    }
  };

  const handleEditNote = (noteId) => {
    navigate(`/dashboard/note/${noteId}`);
  };

  const handleCreateNote = () => {
    navigate('/dashboard/new');
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
          onClick={handleCreateNote}
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
            <Button onClick={handleCreateNote} icon={Plus} iconPosition="left">
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
                      onClick={() => handleEditNote(note.id)}
                      className="p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShareNote(note.id)}
                      className="p-1"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1 text-error-600 hover:text-error-700"
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
    </div>
  );
};

export default DashboardPage;
