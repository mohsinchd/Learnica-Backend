import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { sendToken } from "../utils/sendToken.js";

// Register New User
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { email, name, password } = req.body;
  const file = req.file;

  if (!email || !name || !password || !file) {
    return next(new ErrorHandler("All Fields are required", 400));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }

  // Upload file on cloudinary

  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  sendToken(res, user, "Registered Successfully", 201);
});

// Login User
export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Email or Password is Incorrect", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("Email or Password is Incorrect", 401));
  }

  const isPasswordMatched = await user.isPasswordMatched(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Email or Password is Incorrect", 401));
  }

  sendToken(res, user, `Welcome Back, ${user.name}`, 200);
});

// Logout User
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});

// Get User Profile
export const getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).json({
    success: true,
    user,
  });
});
