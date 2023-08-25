import express from "express";
import {
  createCourseReview,
  createNewCourse,
  deleteCourse,
  deleteReview,
  getAllCourses,
  getAllReviews,
  getCourseDetails,
  getInstructorCourses,
  updateCourse,
} from "../controllers/courseControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/instructor/courses").get(isAuthenticated, getInstructorCourses);

router
  .route("/")
  .get(getAllCourses)
  .post(isAuthenticated, singleUpload, createNewCourse);

router
  .route("/:id")
  .get(getCourseDetails)
  .put(isAuthenticated, singleUpload, updateCourse)
  .delete(isAuthenticated, deleteCourse);

router.route("/user/review").put(isAuthenticated, createCourseReview);
router
  .route("/user/reviews")
  .get(getAllReviews)
  .delete(isAuthenticated, deleteReview);

export default router;
