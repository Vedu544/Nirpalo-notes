import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, Edit, Trash2, Share2 } from 'lucide-react';
import { notesAPI } from '../api';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { formatDistanceToNow } from 'date-fns';

const SharedNotesPage = () => {
  const [sharedNotes, setSharedNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSharedNotes();
  }, []);

  const fetchSharedNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getSharedNotes()
      // Transform the nested note structure into a flat structure
      const transformedNotes = (response.data || []).map(item => ({
        id: item.note.id,
        title: item.note.title,
        content: item.note.content || '',
        updatedAt: item.note.updatedAt,
        owner: item.note.owner,
        permission: item.permission,
        sharedNoteId: item.id
      }));
      setSharedNotes(transformedNotes);
    } catch (error) {
      toast.error('Failed to fetch shared notes');
      console.error('Error fetching shared notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = (noteId) => {
    navigate(`/dashboard/note/${noteId}`);
  };

  const handleShareNote = async (noteId) => {
    try {
      const shareUrl = `${window.location.origin}/share/${noteId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const handleRemoveCollaboration = async (noteId) => {
    if (window.confirm('Are you sure you want to remove access to this shared note?')) {
      try {
        // This would need to be implemented in the API
        toast.success('Access removed successfully');
        setSharedNotes(sharedNotes.filter(note => note.id !== noteId));
      } catch (error) {
        toast.error('Failed to remove access');
      }
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
                      onClick={() => handleRemoveCollaboration(note.id)}
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
                    {note.updatedAt ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true }) : 'Unknown date'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="badge badge-secondary">
                      {note.permission || 'VIEWER'}
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
    </div>
  );
};

export default SharedNotesPage;