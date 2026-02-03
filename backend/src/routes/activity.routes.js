import express from "express";
import { 
  getActivities,
  getNoteActivitiesController 
} from "../controllers/activity.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

// Get all user activities
router.get("/", getActivities);

// Get activities for a specific note
router.get("/note/:noteId", getNoteActivitiesController);

export default router;