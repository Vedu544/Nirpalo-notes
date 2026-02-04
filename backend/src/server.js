import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import app from "./app.js";
import { initSocket } from "./services/socket.service.js";

dotenv.config();

/* ------------------ SERVER SETUP ------------------ */
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

/* ------------------ SOCKET.IO ------------------ */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
});

initSocket(io);

/* ------------------ START SERVER ------------------ */
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
