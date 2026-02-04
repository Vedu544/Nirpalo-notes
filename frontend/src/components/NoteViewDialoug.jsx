import React from 'react';
import { X, Eye, User, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import Button from './common/Button';

const NoteViewDialog = ({ isOpen, onClose, note }) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header with Read-Only Badge */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-6 py-4 flex items-center justify-between border-b border-primary-200">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">View Note</h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Section */}
          <div>
            <label className="block text-xs text-secondary-600 uppercase tracking-wide font-medium mb-2">
              Title
            </label>
            <h3 className="text-3xl font-bold text-secondary-900 break-words">
              {note.title}
            </h3>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary-50 rounded-lg">
            {/* Owner */}
            {note.owner && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-secondary-600 uppercase tracking-wide font-medium">
                    Owner
                  </p>
                  <p className="font-semibold text-secondary-900">
                    {note.owner.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {note.owner.email}
                  </p>
                </div>
              </div>
            )}

            {/* Created Date */}
            {note.createdAt && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-secondary-600 uppercase tracking-wide font-medium">
                    Created
                  </p>
                  <p className="font-semibold text-secondary-900">
                    {format(new Date(note.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )}

            {/* Last Updated */}
            {note.updatedAt && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-secondary-400 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-xs text-secondary-600 uppercase tracking-wide font-medium">
                    Updated
                  </p>
                  <p className="font-semibold text-secondary-900">
                    {format(new Date(note.updatedAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div>
            <label className="block text-xs text-secondary-600 uppercase tracking-wide font-medium mb-3">
              Content
            </label>
            <div className="bg-secondary-50 rounded-lg p-6 min-h-64 border border-secondary-200">
              <div className="whitespace-pre-wrap text-secondary-900 font-mono text-sm leading-relaxed">
                {note.content || 'No content'}
              </div>
            </div>
          </div>

          {/* Character Count */}
          <div className="flex justify-between items-center text-sm text-secondary-600 bg-secondary-50 p-4 rounded-lg">
            <span>Read-Only View</span>
            <span>{note.content?.length || 0} characters</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-secondary-50 px-6 py-4 border-t border-secondary-200">
          <Button
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NoteViewDialog;