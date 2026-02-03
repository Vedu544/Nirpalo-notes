import prisma from "../config/db.js";

// Get all users (except current user) for sharing
export const getAllUsers = async (currentUserId) => {
  return await prisma.user.findMany({
    where: {
      id: { not: currentUserId } // Exclude current user
    },
    select: {
      id: true,
      name: true,
      email: true
    },
    orderBy: {
      name: "asc" // Sort by name
    }
  });
};

// Get public note by share token (for read-only links)
export const getPublicNoteByToken = async (token) => {
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
              name: true,
              email: true
            }
          }
        }
      }
    }
  });
  if (!shareLink) {
    throw new Error("Invalid or expired share link");
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