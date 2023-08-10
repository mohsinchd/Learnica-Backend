import express from "express";
import {
  createNewCourse,
  deleteCourse,
  getAllCourses,
  getCourseDetails,
  updateCourse,
} from "../controllers/courseControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router
  .route("/")
  .get(getAllCourses)
  .post(isAuthenticated, singleUpload, createNewCourse);

router
  .route("/:id")
  .get(getCourseDetails)
  .put(isAuthenticated, singleUpload, updateCourse)
  .delete(isAuthenticated, deleteCourse);

export default router;
