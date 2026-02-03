import express from "express";
import {
  shareNoteController,
  getPublicNoteController,
  getSharedNotesController,
  getNoteCollaboratorsController,
  removeCollaboratorController,
  updateCollaboratorPermissionController
} from "../controllers/share.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public route - NO authentication required
router.get("/public/:token", getPublicNoteController);

// Protected routes - authentication required
router.use(authenticate);

router.post("/:noteId", shareNoteController);  // Share a note
router.get("/shared-with-me", getSharedNotesController);  // Get notes shared with me
router.get("/:noteId/collaborators", getNoteCollaboratorsController);  // Get collaborators of a note
router.patch("/:noteId/collaborator/:userId", updateCollaboratorPermissionController);  // Update collaborator permission
router.delete("/:noteId/collaborator/:userId", removeCollaboratorController);  // Remove collaborator

export default router;