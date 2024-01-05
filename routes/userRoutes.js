import express from "express";
import {
  changePassword,
  forgotPassword,
  getEnrolledCourseDetails,
  getEnrolledCourses,
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updateProfilePicture,
  updateUserProfile,
  verifyUser,
} from "../controllers/userControllers.js";
import singleUpload from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import { hasPurchased } from "../middlewares/hasPurchased.js";

const router = express.Router();
// Register User
router.route("/register").post(singleUpload, registerUser);
// Login User
router.route("/login").post(loginUser);
// Verify user
router.route("/verify/:email").get(verifyUser);
// Logout User
router.route("/logout").get(logoutUser);
// Get Logged In user profile & update Profile
router
  .route("/me")
  .get(isAuthenticated, getUserProfile)
  .put(isAuthenticated, updateUserProfile);

router.route("/changePassword").put(isAuthenticated, changePassword);

// Fogot Password
router.route("/forgotPassword").post(forgotPassword);
// Reset Password
router.route("/resetPassword/:token").put(resetPassword);
// Update Profile Picture
router
  .route("/updateProfilePicture")
  .put(singleUpload, isAuthenticated, updateProfilePicture);

// Get User enrolled Courses
router.route("/enrolledCourses").get(isAuthenticated, getEnrolledCourses);
router
  .route("/enrolledCourse/:id")
  .get(isAuthenticated, hasPurchased, getEnrolledCourseDetails);

export default router;
