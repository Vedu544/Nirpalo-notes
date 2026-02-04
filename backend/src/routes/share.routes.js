import express from "express";
import {
  generateShareLinkController,
  getAllUsersForSharingController,
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

// Generate a public share link for a note
router.post("/:noteId/generate-link", generateShareLinkController);

// Get all users for sharing (except current user)
// SIMPLE - just exclude current user, no other filtering
router.get("/users/all", getAllUsersForSharingController);

// Share a note with another user
// VALIDATION happens here - checks if already shared
router.post("/:noteId", shareNoteController);

// Get notes shared with current user
router.get("/shared-with-me", getSharedNotesController);

// Get all collaborators of a specific note
router.get("/:noteId/collaborators", getNoteCollaboratorsController);

// Update collaborator permission (VIEWER <-> EDITOR)
router.patch("/:noteId/collaborator/:userId", updateCollaboratorPermissionController);

// Remove a collaborator from a note
router.delete("/:noteId/collaborator/:userId", removeCollaboratorController);

export default router;