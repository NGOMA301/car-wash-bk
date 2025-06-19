// routes/activity.routes.js
import express from "express";
import { getMyActivities } from "../controllers/activity.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", requireAuth, getMyActivities);

export default router;
