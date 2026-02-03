import express from "express";
import { createNoteController, getNotesController, deleteNoteController, updateNoteController } from "../controllers/note.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);  // ← Apply to all routes

router.post("/create", createNoteController);     // ← Use controller
router.get("/", getNotesController);               // ← Use controller
router.put("/:noteId", updateNoteController);      // ← Update note
router.delete("/:noteId", deleteNoteController);   // ← Use controller

export default router;