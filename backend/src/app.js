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

// Enable CORS (MUST be before routes)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
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
app.use(errorHandler);

export default app;