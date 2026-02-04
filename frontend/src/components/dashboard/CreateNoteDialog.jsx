import React from 'react';
import { X } from 'lucide-react';
import Button from '../common/Button';

const CreateNoteDialog = ({
  isOpen,
  onClose,
  formData,
  onFormChange,
  onSubmit,
  isLoading
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">Create New Note</h2>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
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
              onChange={onFormChange}
              className="form-input w-full"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-secondary-700 mb-2">
              Content
            </label>
            <textarea
              id="content"
              name="content"
              placeholder="Enter note content..."
              value={formData.content}
              onChange={onFormChange}
              rows="6"
              className="form-input w-full resize-none"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-secondary-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !formData.title.trim()}
            className="flex-1"
          >
            {isLoading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteDialog;