import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is Required"],
  },
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid Email"],
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
    minLength: [8, "Password cannot be shorter then 8 characters"],
  },
  role: {
    type: String,
    default: "user",
  },
  enrolledCourses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
  ],
  isVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: String,
});

// Get Json web token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

// Encrypt Password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare Password
userSchema.methods.isPasswordMatched = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Reset Password Token
userSchema.methods.getResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
