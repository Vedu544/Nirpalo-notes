import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Share2, Edit, Trash2, Eye } from 'lucide-react';
import { notesAPI } from '../api';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';

const NoteEditorPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { currentNote, setCurrentNote, joinNote, leaveNote, updateNote, isConnected } = useSocket();
  
  const [note, setNote] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(noteId === 'new');

  useEffect(() => {
    if (noteId === 'new') {
      setLoading(false);
      setIsEditing(true);
    } else {
      fetchNote();
    }
  }, [noteId]);

  useEffect(() => {
    if (noteId !== 'new' && note.id && isConnected) {
      joinNote(note.id);
      return () => leaveNote(note.id);
    }
  }, [note.id, noteId, isConnected]);

  useEffect(() => {
    if (currentNote && currentNote.id === note.id) {
      setNote(prev => ({
        ...prev,
        content: currentNote.content || prev.content
      }));
    }
  }, [currentNote]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getById(noteId);
      const noteData = response.data;
      setNote({
        title: noteData.title,
        content: noteData.content
      });
      setCurrentNote(noteData);
    } catch (error) {
      toast.error('Failed to fetch note');
      console.error('Error fetching note:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!note.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setSaving(true);
      
      if (noteId === 'new') {
        // Create new note
        const response = await notesAPI.create({
          title: note.title.trim(),
          content: note.content
        });
        
        toast.success('Note created successfully!');
        navigate(`/dashboard/note/${response.data.id}`);
      } else {
        // Update existing note
        await notesAPI.update(noteId, {
          title: note.title.trim(),
          content: note.content
        });
        
        // Also send real-time update
        if (isConnected) {
          updateNote(noteId, note.content, new Date().toISOString());
        }
        
        toast.success('Note saved successfully!');
      }
    } catch (error) {
      toast.error('Failed to save note');
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/share/${noteId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await notesAPI.delete(noteId);
        toast.success('Note deleted successfully!');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete note');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading note..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            icon={ArrowLeft}
            iconPosition="left"
          >
            Back to Notes
          </Button>
          
          {isEditing ? (
            <h2 className="text-xl font-semibold text-secondary-900">
              {noteId === 'new' ? 'New Note' : 'Edit Note'}
            </h2>
          ) : (
            <h2 className="text-xl font-semibold text-secondary-900">
              {note.title}
            </h2>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {noteId !== 'new' && (
            <>
              <Button
                variant="secondary"
                onClick={handleShare}
                icon={Share2}
                iconPosition="left"
              >
                Share
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => setIsEditing(!isEditing)}
                icon={isEditing ? Eye : Edit}
                iconPosition="left"
              >
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
              
              <Button
                variant="error"
                onClick={handleDelete}
                icon={Trash2}
                iconPosition="left"
              >
                Delete
              </Button>
            </>
          )}
          
          {isEditing && (
            <Button
              onClick={handleSave}
              loading={saving}
              icon={Save}
              iconPosition="left"
            >
              {noteId === 'new' ? 'Create' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      {/* Note Content */}
      <Card>
        <div className="p-6 space-y-6">
          {isEditing ? (
            <>
              <Input
                label="Note Title"
                type="text"
                value={note.title}
                onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter note title..."
                required
              />
              
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  value={note.content}
                  onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Start writing your note..."
                  className="form-textarea note-editor"
                  rows={15}
                />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-secondary-900">
                {note.title}
              </h1>
              
              <div className="prose prose-lg max-w-none">
                {note.content ? (
                  <div className="whitespace-pre-wrap text-secondary-700">
                    {note.content}
                  </div>
                ) : (
                  <p className="text-secondary-500 italic">No content</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Collaboration Status */}
      {noteId !== 'new' && isConnected && (
        <Card className="bg-primary-50 border-primary-200">
          <div className="p-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            <span className="text-sm text-primary-800">
              Real-time collaboration enabled
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default NoteEditorPage;
