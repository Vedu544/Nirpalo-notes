import { shareNoteService } from "../services/notes.service.js";
import {
  getAllUsers,
  getPublicNoteByToken,
  getSharedNotes,
  getNoteCollaborators,
  removeCollaborator,
  updateCollaboratorPermission
} from "../services/share.service.js";

// Get all users (except current user) for sharing
export const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsers(req.user.id);
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// Share a note with another user (add collaborator)
export const shareNoteController = async (req, res, next) => {
  try {
    const { sharedWithUserId, permission } = req.body;
    const { noteId } = req.params;

    if (!sharedWithUserId) {
      return res.status(400).json({
        success: false,
        message: "sharedWithUserId is required"
      });
    }

    // Default permission to VIEWER if not specified
    const result = await shareNoteService({
      noteId,
      ownerId: req.user.id,
      sharedWithUserId,
      permission: permission || "VIEWER"
    });

    res.status(200).json({
      success: true,
      message: "Note shared successfully",
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Get public note by share token (NO authentication required)
export const getPublicNoteController = async (req, res, next) => {
  try {
    const { token } = req.params;
    const note = await getPublicNoteByToken(token);
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

// Get all notes shared WITH the logged-in user
export const getSharedNotesController = async (req, res, next) => {
  try {
    const sharedNotes = await getSharedNotes(req.user.id);
    res.status(200).json({
      success: true,
      data: sharedNotes
    });
  } catch (error) {
    next(error);
  }
};

// Get all collaborators of a specific note
export const getNoteCollaboratorsController = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    const collaborators = await getNoteCollaborators(noteId, req.user.id);
    res.status(200).json({
      success: true,
      data: collaborators
    });
  } catch (error) {
    next(error);
  }
};

// Remove a collaborator from a note
export const removeCollaboratorController = async (req, res, next) => {
  try {
    const { noteId, userId } = req.params;
    await removeCollaborator(noteId, req.user.id, userId);
    res.status(200).json({
      success: true,
      message: "Collaborator removed successfully"
    });
  } catch (error) {
    next(error);
  }
};

// Update collaborator permission (VIEWER <-> EDITOR)
export const updateCollaboratorPermissionController = async (req, res, next) => {
  try {
    const { noteId, userId } = req.params;
    const { permission } = req.body;

    if (!permission) {
      return res.status(400).json({
        success: false,
        message: "permission is required"
      });
    }

    const updated = await updateCollaboratorPermission(
      noteId,
      req.user.id,
      userId,
      permission
    );
    res.status(200).json({
      success: true,
      message: "Permission updated successfully",
      data: updated
    });
  } catch (error) {
    next(error);
  }
};