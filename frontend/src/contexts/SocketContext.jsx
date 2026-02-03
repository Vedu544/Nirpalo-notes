import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Create context
const SocketContext = createContext();

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const { user, token, isAuthenticated } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (isAuthenticated && token) {
      const socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: {
          token: token,
        },
      });

      // Connection events
      socketInstance.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to server');
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        setActiveUsers([]);
        console.log('Disconnected from server');
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Connection error:', error);
        toast.error('Failed to connect to server');
      });

      // Note collaboration events
      socketInstance.on('active-users', (users) => {
        setActiveUsers(users);
      });

      socketInstance.on('user-joined', (userData) => {
        toast.success(`${userData.name} joined the note`);
      });

      socketInstance.on('user-left', (userData) => {
        toast(`${userData.name} left the note`, {
          icon: '👋',
        });
      });

      socketInstance.on('note-updated', (data) => {
        // This will be handled by the note component
        setCurrentNote(prev => ({
          ...prev,
          content: data.content,
          updatedAt: data.version,
          updatedBy: data.updatedBy,
        }));
      });

      socketInstance.on('conflict', (data) => {
        toast.error('Conflict detected! Your changes were not saved.');
        setCurrentNote(prev => ({
          ...prev,
          content: data.currentContent,
          updatedAt: data.currentVersion,
        }));
      });

      socketInstance.on('update-confirmed', (data) => {
        setCurrentNote(prev => ({
          ...prev,
          updatedAt: data.version,
        }));
      });

      socketInstance.on('note-created', (data) => {
        toast.success('New note created');
      });

      socketInstance.on('note-deleted', (data) => {
        toast.error('Note was deleted');
        if (currentNote?.id === data.noteId) {
          setCurrentNote(null);
        }
      });

      socketInstance.on('cursor-update', (data) => {
        // This will be handled by the editor component
        window.dispatchEvent(new CustomEvent('cursor-update', { detail: data }));
      });

      socketInstance.on('error', (error) => {
        toast.error(error);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setActiveUsers([]);
      }
    }
  }, [isAuthenticated, token]);

  // Socket functions
  const joinNote = (noteId) => {
    if (socket && isConnected) {
      socket.emit('join-note', noteId);
    }
  };

  const leaveNote = (noteId) => {
    if (socket && isConnected) {
      socket.emit('leave-note', noteId);
    }
  };

  const updateNote = (noteId, content, version) => {
    if (socket && isConnected) {
      socket.emit('note-update', { noteId, content, version });
    }
  };

  const sendCursorPosition = (noteId, position) => {
    if (socket && isConnected) {
      socket.emit('cursor-position', { noteId, position });
    }
  };

  const value = {
    socket,
    isConnected,
    activeUsers,
    currentNote,
    setCurrentNote,
    joinNote,
    leaveNote,
    updateNote,
    sendCursorPosition,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
