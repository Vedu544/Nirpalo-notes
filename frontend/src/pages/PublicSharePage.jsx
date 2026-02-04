import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, Home, Lock, User, Calendar } from 'lucide-react';
import { shareAPI } from '../api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { formatDistanceToNow, format } from 'date-fns';

const PublicSharePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicNote();
  }, [token]);

  const fetchPublicNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shareAPI.getPublicNote(token);
      setNote(response.data);
    } catch (err) {
      if (err.response?.status === 410) {
        // Note was deleted
        setError({
          type: 'deleted',
          message: 'Note was deleted by owner'
        });
      } else if (err.response?.status === 404) {
        // Invalid link
        setError({
          type: 'invalid',
          message: 'Invalid or expired share link'
        });
      } else {
        setError({
          type: 'error',
          message: 'Failed to load note'
        });
      }
      console.error('Error fetching public note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/public/share/${token}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
      console.error('Error copying link:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading note..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="mb-4">
            <Lock className="w-16 h-16 text-error-400 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            {error.type === 'deleted' ? 'Note Deleted' : 'Link Expired'}
          </h1>
          <p className="text-secondary-600 mb-6">
            {error.message}
          </p>
          <Button
            onClick={() => navigate('/')}
            className="w-full"
            icon={Home}
            iconPosition="left"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 to-secondary-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/')}
            icon={Home}
            iconPosition="left"
            className="mb-6"
          >
            Back to Home
          </Button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Read-Only Badge */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-3 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-700">Read-Only View</span>
          </div>

          {/* Title Section */}
          <div className="p-8 border-b border-secondary-200">
            <h1 className="text-4xl font-bold text-secondary-900 mb-6 break-words">
              {note.title}
            </h1>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Owner */}
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-secondary-600 uppercase tracking-wide font-medium">
                    Shared by
                  </p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {note.owner?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {note.owner?.email}
                  </p>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-secondary-600 uppercase tracking-wide font-medium">
                    Created
                  </p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-secondary-600 uppercase tracking-wide font-medium">
                    Last Updated
                  </p>
                  <p className="text-lg font-semibold text-secondary-900">
                    {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="prose prose-sm max-w-none">
              <div className="bg-secondary-50 rounded-lg p-6 min-h-96 whitespace-pre-wrap text-secondary-900 font-mono text-sm leading-relaxed border border-secondary-200">
                {note.content || 'No content'}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-secondary-50 px-8 py-6 border-t border-secondary-200 flex gap-3 justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-secondary-600">
                💡 This is a read-only shared view. You cannot edit this note.
              </p>
            </div>
            <Button
              onClick={handleCopyLink}
              icon={Copy}
              iconPosition="left"
              size="sm"
            >
              Copy Link
            </Button>
          </div>
        </div>

        {/* Character Count */}
        <div className="mt-6 text-center text-secondary-600 text-sm">
          {note.content?.length || 0} characters
        </div>
      </div>
    </div>
  );
};

export default PublicSharePage;