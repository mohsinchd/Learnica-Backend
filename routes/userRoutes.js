import express from "express";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/userControllers.js";
import singleUpload from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();
// Register User
router.route("/register").post(singleUpload, registerUser);
// Login User
router.route("/login").post(loginUser);
// Logout User
router.route("/logout").get(logoutUser);
// Get Logged In user profile
router.route("/me").get(isAuthenticated, getUserProfile);

export default router;
