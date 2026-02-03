import {
  getUserActivities,
  getNoteActivities
} from "../services/activity.service.js";

// Get all activities for the logged-in user
export const getActivities = async (req, res, next) => {
  try {
    const activities = await getUserActivities(req.user.id);

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};

// Get activities for a specific note
export const getNoteActivitiesController = async (req, res, next) => {
  try {
    const activities = await getNoteActivities(
      req.params.noteId,
      req.user.id
    );

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};