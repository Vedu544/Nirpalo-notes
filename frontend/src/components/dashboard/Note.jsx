import React from 'react';
import { Edit, Trash2, Share2, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Button from '../common/Button';
import Card from '../common/Card';

const NoteCard = ({ 
  note, 
  onView, 
  onEdit, 
  onDelete, 
  onGetShareLink, 
  onShareWithUsers 
}) => {
  return (
    <Card 
      hover 
      className="group cursor-pointer transition-all"
      onClick={() => onView(note)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-secondary-900 line-clamp-2 flex-1">
            {note.title}
          </h3>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onEdit(note, e)}
              className="p-1"
              title="Edit note"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onGetShareLink(note.id, e)}
              className="p-1"
              title="Get public share link"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onShareWithUsers(note, e)}
              className="p-1"
              title="Share with users"
            >
              <Users className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => onDelete(note.id, e)}
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
  );
};

export default NoteCard;