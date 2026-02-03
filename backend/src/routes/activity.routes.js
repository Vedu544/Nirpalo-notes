import express from "express";
import { 
  getActivities,
  getNoteActivitiesController,
  getActivityStatsController
} from "../controllers/activity.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authenticate);

// Get all user activities
router.get("/user", getActivities);

// Get activity statistics
router.get("/stats", getActivityStatsController);

// Get activities for a specific note
router.get("/note/:noteId", getNoteActivitiesController);

export default router;