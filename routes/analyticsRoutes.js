import express from "express";

import { isAuthenticated } from "../middlewares/auth.js";
import { getTeacherAnalytics } from "../controllers/analyticsControllers.js";

const router = express.Router();

router.route("/teacher").get(isAuthenticated, getTeacherAnalytics);

export default router;
