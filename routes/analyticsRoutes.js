import express from "express";

import { isAdmin, isAuthenticated } from "../middlewares/auth.js";
import {
  deleteUser,
  getAdminAnalytics,
  getAllCourses,
  getAllUsers,
  getSingleCourse,
  getSingleUser,
  getTeacherAnalytics,
} from "../controllers/analyticsControllers.js";

const router = express.Router();

router.route("/teacher").get(isAuthenticated, getTeacherAnalytics);
router.route("/admin").get(isAuthenticated, isAdmin, getAdminAnalytics);

router.route("/admin/users").get(isAuthenticated, isAdmin, getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticated, isAdmin, getSingleUser)
  .delete(isAuthenticated, isAdmin, deleteUser);

router.route("/admin/courses").get(isAuthenticated, isAdmin, getAllCourses);
router
  .route("/admin/course/:id")
  .get(isAuthenticated, isAdmin, getSingleCourse);

export default router;
