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
  const note = await prisma.note.updateMany({
    where: {
      id: noteId,
      ownerId
    },
    data: {
      title,
      content
    }
  });

  if (note.count === 0) {
    throw new Error("Note not found or access denied");
  }

  // 🔥 Auto-log the UPDATE activity
  await createActivity({
    userId: ownerId,
    noteId,
    action: "UPDATE"
  });

  return note;
};

export const getNotes = async (ownerId) => {
  return await prisma.note.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" }
  });
};

export const deleteNote = async (noteId, ownerId) => {
  const result = await prisma.note.deleteMany({
    where: {
      id: noteId,
      ownerId
    }
  });

  if (result.count > 0) {
    // Auto-log the DELETE activity
    await createActivity({
      userId: ownerId,
      noteId,
      action: "DELETE"
    });

    // Emit real-time event for deleted note
    emitToNote(noteId, "note-deleted", {
      noteId,
      deletedBy: ownerId
    });
  }

  return result;
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

  const share = await prisma.noteCollaborator.create({  // ← Fixed model name
    data: {
      noteId,
      userId: sharedWithUserId,
      permission: "VIEWER"  // ← Use enum value from schema
    }
  });

  // Create shareable link
  const shareLink = await prisma.shareLink.create({
    data: {
      noteId,
      token: shareToken
    }
  });

  // 🔥 Auto-log the SHARE activity
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