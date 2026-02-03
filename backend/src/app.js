import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js"
import noteRoutes from "./routes/note.routes.js"
import activityRoutes from "./routes/activity.routes.js";
import shareRoutes from "./routes/share.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
const app = express();

/* ------------------ MIDDLEWARES ------------------ */

// Parse JSON body
app.use(express.json());

app.use(errorHandler);

// Enable CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

/* ------------------ HEALTH CHECK ------------------ */
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

/* ------------------ ROUTES ------------------ */
app.use("/api/auth", authRoutes);
app.use("/api/note", noteRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/share", shareRoutes);

/* ------------------ GLOBAL ERROR HANDLER ------------------ */
// Will be enhanced later
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
