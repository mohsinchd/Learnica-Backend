import { User } from "../models/User.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";

export const hasPurchased = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  //   Check if user has purchased the course

  const isPurchased = user.enrolledCourses.find(
    (course) => course.toString() === req.params.id.toString()
  );

  if (!isPurchased) {
    return next(
      new ErrorHandler(
        "You haven't purchased this course. Purchase first to access",
        400
      )
    );
  }

  next();
});
