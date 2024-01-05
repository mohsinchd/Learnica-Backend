import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import cloudinary from "cloudinary";
import getDataUri from "../utils/dataUri.js";
import { sendToken } from "../utils/sendToken.js";
import { sendEmail, sendVerificationEmail } from "../utils/sendEmail.js";
import { Course } from "../models/Course.js";
import crypto from "crypto";
import { verificationMessage } from "../utils/verificationTemplate.js";

// Register New User
export const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { email, name, password } = req.body;
  const file = req.file;

  if (!email || !name || !password) {
    return next(new ErrorHandler("All Fields are required", 400));
  }

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }

  // Upload file on cloudinary
  if (file) {
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
  } else {
    user = await User.create({
      name,
      email,
      password,
    });
  }

  const url = `${process.env.API_URL}/api/v1/user/verify/${user.email}`;

  const message = `${url}`;

  await sendVerificationEmail(
    user.email,
    "Learnica Email verification",
    message
  );

  res.status(201).json({
    success: true,
    message:
      "User Registered successfully. Please verify your email before logging in into the application.",
  });

  // sendToken(res, user, "Registered Successfully", 201);
});

// Verify user
export const verifyUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });

  user.isVerified = true;

  await user.save();

  res
    .status(200)
    .send(verificationMessage(`${process.env.FRONTEND_URL}/login`));
});

//

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

  if (!user.isVerified) {
    return next(new ErrorHandler("Email is Not Verified.", 401));
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

// Update User Profile
export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const { name, email } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User Profile Updated.",
  });
});

// Update User Password
export const changePassword = catchAsyncErrors(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  // Match Old password in the DB.

  const isMatched = await user.isPasswordMatched(oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Old Password is incorrect.", 400));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Updated Successfully.",
  });
});

// Forgot Password
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErrorHandler("Email is Required.", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("No User Found with the given email.", 404));
  }

  const resetToken = user.getResetToken();

  await user.save();

  const url = `${process.env.FRONTEND_URL}/api/v1/user/resetPassword/${resetToken}`;

  const message = `${url}`;

  await sendEmail(user.email, "Learnica Reset Password", message);

  res.status(200).json({
    success: true,
    message: `Reset Token has been sent to ${user.email}`,
  });
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.params;

  const { newPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    return next(
      new ErrorHandler("Reset Token is Invalid or has been expired", 400)
    );
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password Reset Successfully. Login with your new password.",
  });
});

// Update Profile Picture
export const updateProfilePicture = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const file = req.file;

  if (!file) {
    return next(new ErrorHandler("Image is Required.", 400));
  }

  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
  if (user.avatar.public_id) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  }

  user.avatar = {
    public_id: myCloud.public_id,
    url: myCloud.secure_url,
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile Picture Updated.",
  });
});

// Get enrolled Courses - Private
export const getEnrolledCourses = catchAsyncErrors(async (req, res, next) => {
  const courses = await User.findOne({ _id: req.user._id }).populate(
    "enrolledCourses",
    "title poster averageRating numOfReviews"
  );

  res
    .status(200)
    .json({ success: true, enrolledCourses: courses.enrolledCourses });
});

export const getEnrolledCourseDetails = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    const course = await Course.findById(id).populate(
      "instructor",
      "name email avatar"
    );
    res.status(200).json({
      success: true,
      course,
    });
  }
);
