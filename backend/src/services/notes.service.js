import prisma from "../config/db.js";
import crypto from "crypto";
import { createActivity } from "./activity.service.js";
import { emitToNote } from "./socket.service.js";

export const createNote = async ({ title, content, ownerId }) => {
  const note = await prisma.note.create({
    data: {
      title,
      content,
      ownerId
    }
  });
  // Auto-log the CREATE activity
  await createActivity({
    userId: ownerId,
    noteId: note.id,
    action: "CREATE"
  });
  // Emit real-time event for new note
  emitToNote(note.id, "note-created", {
    note,
    createdBy: ownerId
  });
  return note;
};

export const updateNote = async ({ noteId, ownerId, title, content }) => {
  // Check if user is the owner
  const note = await prisma.note.findFirst({
    where: { id: noteId }
  });
  if (!note) {
    throw new Error("NOTE_NOT_FOUND");
  }
  // If not owner, check if they're a collaborator with EDITOR permission
  if (note.ownerId !== ownerId) {
    const collaborator = await prisma.noteCollaborator.findFirst({
      where: {
        noteId,
        userId: ownerId,
        permission: "EDITOR" // Only EDITOR can update
      }
    });
    if (!collaborator) {
      throw new Error("PERMISSION_DENIED");
    }
  }
  // Now update the note
  const result = await prisma.note.update({
    where: { id: noteId },
    data: { title, content }
  });
  // Log the activity
  await createActivity({
    userId: ownerId,
    noteId,
    action: "UPDATE"
  });
  // Emit real-time event
  emitToNote(noteId, "note-updated", {
    note: result,
    updatedBy: ownerId
  });
  return result;
};

export const getNotes = async (ownerId) => {
  return await prisma.note.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" }
  });
};

export const deleteNote = async (noteId, ownerId) => {
  try {
    // Step 1: Verify ownership FIRST
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        ownerId
      }
    });

    if (!note) {
      throw new Error("NOTE_NOT_FOUND");
    }

    // Step 2: Delete ALL related records in order (IMPORTANT!)
    // Delete activity logs FIRST (they have FK to note)
    await prisma.activityLog.deleteMany({
      where: { noteId }
    });

    // Delete collaborators
    await prisma.noteCollaborator.deleteMany({
      where: { noteId }
    });

    // Delete share links
    await prisma.shareLink.deleteMany({
      where: { noteId }
    });

    // Step 3: NOW delete the note itself
    const result = await prisma.note.delete({
      where: { id: noteId }
    });

    // Step 4: Emit real-time event for deleted note
    emitToNote(noteId, "note-deleted", {
      noteId,
      deletedBy: ownerId
    });

    return result;
  } catch (error) {
    if (error.message === "NOTE_NOT_FOUND") {
      throw error; // Re-throw with proper message
    }
    console.error("Error deleting note:", error);
    throw new Error("Failed to delete note");
  }
};

export const shareNoteService = async ({ noteId, ownerId, sharedWithUserId }) => {
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      ownerId
    }
  });
  if (!note) {
    throw new Error("Note not found or access denied");
  }
  const shareToken = crypto.randomBytes(20).toString("hex");
  const share = await prisma.noteCollaborator.create({
    data: {
      noteId,
      userId: sharedWithUserId,
      permission: "VIEWER"
    }
  });
  // Create shareable link
  const shareLink = await prisma.shareLink.create({
    data: {
      noteId,
      token: shareToken
    }
  });
  // Auto-log the SHARE activity
  await createActivity({
    userId: ownerId,
    noteId,
    action: "SHARE"
  });
  return {
    shareId: share.id,
    token: shareToken,
    shareUrl: `${process.env.APP_URL}/share/${shareToken}`
  };
};