import express from "express";
import {
  addLectures,
  addNewSection,
  deleteLecture,
  deleteSection,
  getAllLectures,
  getAllSections,
  updateCourseSection,
  updateLecture,
} from "../controllers/sectionControllers.js";
import { isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router
  .route("/:id")
  .post(isAuthenticated, addNewSection)
  .get(isAuthenticated, getAllSections);
router
  .route("/:courseId/:sectionId")
  .get(isAuthenticated, getAllLectures)
  .put(isAuthenticated, updateCourseSection)
  .post(isAuthenticated, singleUpload, addLectures)
  .delete(isAuthenticated, deleteSection);

router
  .route("/:courseId/:sectionId/:lectureId")
  .put(isAuthenticated, singleUpload, updateLecture)
  .delete(isAuthenticated, deleteLecture);

export default router;
