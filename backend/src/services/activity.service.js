import prisma from "../config/db.js";

export const createActivity = async ({ userId, noteId, action }) => {
  return prisma.activityLog.create({
    data: {
      userId,
      noteId,
      action
    }
  });
};

export const getUserActivities = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  return prisma.activityLog.findMany({
    where: { userId },
    include: {
      note: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit
  });
};

export const getNoteActivities = async (noteId, userId, page = 1, limit = 20) => {
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

  const skip = (page - 1) * limit;

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
    orderBy: { createdAt: "desc" },
    skip,
    take: limit
  });
};

export const getActivityStats = async (userId, noteId = null) => {
  const where = noteId 
    ? { noteId } 
    : { userId };

  const activities = await prisma.activityLog.findMany({ where });

  return {
    total: activities.length,
    create: activities.filter(a => a.action === 'CREATE').length,
    update: activities.filter(a => a.action === 'UPDATE').length,
    delete: activities.filter(a => a.action === 'DELETE').length,
    share: activities.filter(a => a.action === 'SHARE').length,
  };
};