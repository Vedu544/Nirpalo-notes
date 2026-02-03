import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { createActivity } from "./activity.service.js";

let ioInstance = null;
const activeUsers = new Map(); // socketId -> { userId, name, noteId }

export const initSocket = (io) => {
  ioInstance = io;

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true }
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user.id;
      socket.userName = user.name;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🔌 User ${socket.userName} connected:`, socket.id);
    activeUsers.set(socket.id, {
      userId: socket.userId,
      name: socket.userName,
      noteId: null
    });

    socket.on("join-note", async (noteId) => {
      try {
        const note = await prisma.note.findFirst({
          where: {
            id: noteId,
            OR: [
              { ownerId: socket.userId },
              { collaborators: { some: { userId: socket.userId } } }
            ]
          }
        });

        if (!note) {
          socket.emit("error", "Access denied to this note");
          return;
        }

        socket.join(noteId);
        
        const userInfo = activeUsers.get(socket.id);
        userInfo.noteId = noteId;
        activeUsers.set(socket.id, userInfo);

        socket.to(noteId).emit("user-joined", {
          userId: socket.userId,
          name: socket.userName,
          socketId: socket.id
        });

        const activeUsersInNote = Array.from(activeUsers.values())
          .filter(user => user.noteId === noteId)
          .map(user => ({
            userId: user.userId,
            name: user.name
          }));

        socket.emit("active-users", activeUsersInNote);
        
        console.log(`📄 ${socket.userName} joined note ${noteId}`);
      } catch (error) {
        socket.emit("error", "Failed to join note");
      }
    });

    socket.on("note-update", async ({ noteId, content, version }) => {
      try {
        const note = await prisma.note.findFirst({
          where: {
            id: noteId,
            OR: [
              { ownerId: socket.userId },
              { 
                collaborators: { 
                  some: { 
                    userId: socket.userId,
                    permission: "EDITOR" 
                  } 
                } 
              }
            ]
          }
        });

        if (!note) {
          socket.emit("error", "Access denied");
          return;
        }

        if (note.updatedAt.getTime() !== new Date(version).getTime()) {
          socket.emit("conflict", {
            currentContent: note.content,
            currentVersion: note.updatedAt
          });
          return;
        }

        const updatedNote = await prisma.note.update({
          where: { id: noteId },
          data: { 
            content,
            updatedAt: new Date()
          }
        });

        await createActivity({
          userId: socket.userId,
          noteId,
          action: "UPDATE"
        });

        socket.to(noteId).emit("note-updated", {
          content,
          version: updatedNote.updatedAt,
          updatedBy: {
            id: socket.userId,
            name: socket.userName
          }
        });

        socket.emit("update-confirmed", {
          version: updatedNote.updatedAt
        });

      } catch (error) {
        console.error("Note update error:", error);
        socket.emit("error", "Failed to update note");
      }
    });

    socket.on("cursor-position", ({ noteId, position }) => {
      socket.to(noteId).emit("cursor-update", {
        userId: socket.userId,
        name: socket.userName,
        position
      });
    });

    socket.on("leave-note", (noteId) => {
      socket.leave(noteId);
      
      const userInfo = activeUsers.get(socket.id);
      if (userInfo) {
        userInfo.noteId = null;
        activeUsers.set(socket.id, userInfo);
      }

      socket.to(noteId).emit("user-left", {
        userId: socket.userId,
        name: socket.userName
      });
    });

    socket.on("disconnect", () => {
      const userInfo = activeUsers.get(socket.id);
      if (userInfo && userInfo.noteId) {
        socket.to(userInfo.noteId).emit("user-left", {
          userId: socket.userId,
          name: socket.userName
        });
      }
      
      activeUsers.delete(socket.id);
      console.log(`❌ User ${socket.userName} disconnected:`, socket.id);
    });
  });
};

export const emitToNote = (noteId, event, data) => {
  if (!ioInstance) return;
  ioInstance.to(noteId).emit(event, data);
};

export const getActiveUsersInNote = (noteId) => {
  return Array.from(activeUsers.values())
    .filter(user => user.noteId === noteId)
    .map(user => ({
      userId: user.userId,
      name: user.name
    }));
};
