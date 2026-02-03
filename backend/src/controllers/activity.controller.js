import {
  getUserActivities,
  getNoteActivities,
  getActivityStats
} from "../services/activity.service.js";

// Get all activities for the logged-in user
export const getActivities = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const activities = await getUserActivities(req.user.id, page, limit);
    res.status(200).json({
      success: true,
      data: activities,
      pagination: { page, limit }
    });
  } catch (error) {
    next(error);
  }
};

// Get activities for a specific note
export const getNoteActivitiesController = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const activities = await getNoteActivities(
      req.params.noteId,
      req.user.id,
      page,
      limit
    );
    res.status(200).json({
      success: true,
      data: activities,
      pagination: { page, limit }
    });
  } catch (error) {
    next(error);
  }
};

// Get activity statistics
export const getActivityStatsController = async (req, res, next) => {
  try {
    const { noteId } = req.query;
    const stats = await getActivityStats(req.user.id, noteId || null);
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};