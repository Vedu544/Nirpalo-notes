import prisma from "../config/db.js";

export const createActivity = async ({ userId, noteId, action }) => {
  return prisma.activityLog.create({  // ← Changed to activityLog
    data: {
      userId,
      noteId,
      action
    }
  });
};

export const getUserActivities = async (userId) => {
  return prisma.activityLog.findMany({  // ← Changed to activityLog
    where: { userId },
    include: {
      note: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};

export const getNoteActivities = async (noteId, userId) => {
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

  return prisma.activityLog.findMany({
    where: { noteId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
};