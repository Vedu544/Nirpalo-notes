# Socket.io Events Documentation

## Client to Server Events

### Authentication
- **Connection**: Client must provide JWT token in `socket.handshake.auth.token`

### Note Collaboration
- `join-note(noteId)` - Join a note room for real-time collaboration
- `leave-note(noteId)` - Leave a note room
- `note-update({ noteId, content, version })` - Update note content with version control
- `cursor-position({ noteId, position })` - Broadcast cursor position to other users

## Server to Client Events

### Connection Events
- `error(message)` - Error message (authentication, access denied, etc.)
- `active-users(users)` - List of active users in current note

### Real-time Updates
- `note-updated({ content, version, updatedBy })` - Note content updated by another user
- `update-confirmed({ version })` - Update confirmed and saved
- `conflict({ currentContent, currentVersion })` - Version conflict detected
- `note-created({ note, createdBy })` - New note created
- `note-deleted({ noteId, deletedBy })` - Note deleted

### User Presence
- `user-joined({ userId, name, socketId })` - User joined the note
- `user-left({ userId, name })` - User left the note
- `cursor-update({ userId, name, position })` - Another user's cursor position

## Frontend Implementation Example

```javascript
// Connect with authentication
const socket = io('http://localhost:5000', {
  auth: {
    token: localStorage.getItem('token')
  }
});

// Join a note
socket.emit('join-note', noteId);

// Listen for updates
socket.on('note-updated', (data) => {
  updateEditorContent(data.content);
});

// Send updates
socket.emit('note-update', {
  noteId,
  content: editorContent,
  version: noteUpdatedAt
});

// Handle conflicts
socket.on('conflict', (data) => {
  showConflictDialog(data.currentContent);
});

// Track active users
socket.on('user-joined', (user) => {
  showUserJoined(user.name);
});

socket.on('user-left', (user) => {
  removeUserFromList(user.userId);
});

// Cursor tracking
socket.on('cursor-update', (data) => {
  showOtherUserCursor(data.userId, data.position);
});

// Send cursor position
editor.on('cursor-change', (position) => {
  socket.emit('cursor-position', {
    noteId,
    position
  });
});
```

## Security Features

1. **Authentication**: All socket connections require valid JWT token
2. **Authorization**: Note access validated before joining rooms
3. **Permission Checks**: Edit permissions verified for updates
4. **Version Control**: Conflict detection using timestamps

## Database Integration

- Real-time updates automatically logged to activity table
- Socket events integrated with existing note services
- Conflict resolution using database timestamps
