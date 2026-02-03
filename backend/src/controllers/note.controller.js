import {
  createNote,
  getNotes,
  deleteNote,
  updateNote
} from "../services/notes.service.js";

export const createNoteController = async (req, res, next) => {
  try {
    console.log(req.body, "body");
    const note = await createNote({
      ...req.body,
      ownerId: req.user.id
    });

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    next(error);
  }
};

export const getNotesController = async (req, res, next) => {
  try {
    const notes = await getNotes(req.user.id);

    res.status(200).json({
      success: true,
      data: notes
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNoteController = async (req, res, next) => {
  try {
    await deleteNote(req.params.noteId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Note deleted"
    });
  } catch (error) {
    next(error);
  }
};

export const updateNoteController = async (req, res, next) => {
  try {
    const note = await updateNote({
      noteId: req.params.noteId,
      ownerId: req.user.id,
      ...req.body
    });
    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    if (error.message === "NOTE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }
    if (error.message === "PERMISSION_DENIED") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to edit this note"
      });
    }
    next(error);
  }
};