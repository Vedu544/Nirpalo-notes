import prisma from "../config/db.js";
import crypto from "crypto";

// Generate a share link for a note
export const generateShareLink = async (noteId, userId) => {
  // Verify user owns the note
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      ownerId: userId
    }
  });

  if (!note) {
    throw new Error("NOTE_NOT_FOUND");
  }

  // Check if share link already exists for this note
  const existingLink = await prisma.shareLink.findFirst({
    where: { noteId }
  });

  if (existingLink) {
    // Return existing token instead of creating duplicate
    return {
      token: existingLink.token,
      shareUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/public/share/${existingLink.token}`
    };
  }

  // Generate new token
  const token = crypto.randomBytes(32).toString('hex');

  // Create share link
  const shareLink = await prisma.shareLink.create({
    data: {
      noteId,
      token
    }
  });

  return {
    token: shareLink.token,
    shareUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/public/share/${shareLink.token}`
  };
};

// Get all users (except current user) - SIMPLE, no exclusion of collaborators
export const getAllUsersForSharing = async (currentUserId) => {
  return await prisma.user.findMany({
    where: {
      id: { not: currentUserId } // Only exclude current user
    },
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: {
      name: "asc"
    }
  });
};

// Get public note by share token - with better error handling
export const getPublicNoteByToken = async (token) => {
  // Find the share link
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      note: {
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }
    }
  });

  // If share link doesn't exist
  if (!shareLink) {
    throw new Error("INVALID_LINK");
  }

  // If share link exists but note was deleted
  if (!shareLink.note) {
    throw new Error("NOTE_DELETED");
  }

  return shareLink.note;
};

// Get all notes shared WITH a user (where they are a collaborator)
export const getSharedNotes = async (userId) => {
  return await prisma.noteCollaborator.findMany({
    where: { userId },
    include: {
      note: {
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

// Get all collaborators of a specific note
export const getNoteCollaborators = async (noteId, userId) => {
  // Verify user has access to this note
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      OR: [
        { ownerId: userId },
        { collaborators: { some: { userId } } }
      ]
    }
  });
  if (!note) {
    throw new Error("Note not found or access denied");
  }
  return await prisma.noteCollaborator.findMany({
    where: { noteId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      note: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });
};

// Remove a collaborator from a note
export const removeCollaborator = async (noteId, ownerId, collaboratorUserId) => {
  // Verify ownership
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      ownerId
    }
  });
  if (!note) {
    throw new Error("Note not found or access denied");
  }
  // Remove collaborator
  const result = await prisma.noteCollaborator.deleteMany({
    where: {
      noteId,
      userId: collaboratorUserId
    }
  });
  if (result.count === 0) {
    throw new Error("Collaborator not found");
  }
  return result;
};

// Update collaborator permission (EDITOR <-> VIEWER)
export const updateCollaboratorPermission = async (
  noteId,
  ownerId,
  collaboratorUserId,
  permission
) => {
  // Verify ownership
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      ownerId
    }
  });
  if (!note) {
    throw new Error("Note not found or access denied");
  }
  // Validate permission
  if (!["EDITOR", "VIEWER"].includes(permission)) {
    throw new Error("Invalid permission. Must be EDITOR or VIEWER");
  }
  // Update permission
  const updated = await prisma.noteCollaborator.updateMany({
    where: {
      noteId,
      userId: collaboratorUserId
    },
    data: {
      permission
    }
  });
  if (updated.count === 0) {
    throw new Error("Collaborator not found");
  }
  return await prisma.noteCollaborator.findFirst({
    where: {
      noteId,
      userId: collaboratorUserId
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};