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
    origin: ["http://localhost:3000", "http://127.0.0.1:5500", "null"],
    methods: ["GET", "POST"],
    credentials: true
  },
});

initSocket(io);

/* ------------------ START SERVER ------------------ */

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
