import React from 'react';
import { X, Users } from 'lucide-react';
import Button from '../common/Button';

const ShareNoteDialog = ({
  isOpen,
  note,
  onClose,
  allUsers,
  selectedUser,
  selectedPermission,
  onSelectUser,
  onPermissionChange,
  onShare,
  isLoadingUsers,
  isSharing
}) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-semibold text-secondary-900">Share with Users</h2>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
            disabled={isSharing}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Note Info */}
          <div className="bg-secondary-50 p-3 rounded-lg">
            <p className="text-xs text-secondary-600 uppercase tracking-wide">Sharing</p>
            <p className="font-medium text-secondary-900 line-clamp-1">{note.title}</p>
          </div>

          {/* Loading State */}
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-secondary-200 border-t-primary-600 rounded-full"></div>
              </div>
            </div>
          ) : allUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
              <p className="text-secondary-600 text-sm">No users available</p>
            </div>
          ) : (
            <>
              {/* Users List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <label className="block text-sm font-medium text-secondary-700 mb-3">
                  Select User
                </label>
                {allUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => onSelectUser(user)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedUser?.id === user.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-secondary-200 bg-secondary-50 hover:border-secondary-300'
                    }`}
                    disabled={isSharing}
                  >
                    <p className="font-medium text-secondary-900">{user.name}</p>
                    <p className="text-xs text-secondary-600">{user.email}</p>
                  </button>
                ))}
              </div>

              {/* Permission Select */}
              {selectedUser && (
                <div>
                  <label htmlFor="permission" className="block text-sm font-medium text-secondary-700 mb-2">
                    Permission
                  </label>
                  <select
                    id="permission"
                    value={selectedPermission}
                    onChange={(e) => onPermissionChange(e.target.value)}
                    className="form-input w-full"
                    disabled={isSharing}
                  >
                    <option value="VIEWER">Viewer - Can only view</option>
                    <option value="EDITOR">Editor - Can edit</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-secondary-200">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSharing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onShare}
            disabled={isSharing || !selectedUser || isLoadingUsers}
            className="flex-1"
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareNoteDialog;