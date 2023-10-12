import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Course } from "../models/Course.js";
import { Earning } from "../models/Earnings.js";

export const getTeacherAnalytics = catchAsyncErrors(async (req, res, next) => {
  const teacherCourses = await Course.find({ instructor: req.user._id });
  const teacherEarning = await Earning.find({ teacher: req.user._id });

  const teacherReviews = await Course.find({ instructor: req.user._id })
    .select("reviews title")
    .limit(5)
    .populate({
      path: "reviews",
      select: "user rating comment",
      populate: {
        path: "user",
        select: "avatar name",
      },
    });

  //   Total Enrollments to a Teacher
  const totalEnrolledStudents = teacherCourses.reduce(
    (acc, course) => course.enrolledStudents.length + acc,
    0
  );
  // Total Earning to a Teacher
  const totalEarning = teacherEarning.reduce(
    (acc, earning) => earning.earningsAmount + acc,
    0
  );
  // How many courses of a Teacher Get enrolled and How many not.
  let totalEnrolledCourses = 0;
  let totalNotEnrolledCourses = 0;
  for (let i = 0; i < teacherCourses.length; i++) {
    if (teacherCourses[i].enrolledStudents.length > 0) {
      totalEnrolledCourses += 1;
    } else {
      totalNotEnrolledCourses += 1;
    }
  }

  //   Total Enrollments at each course.
  let map = {};
  let singleCourseEnrollments = [];
  for (let i = 0; i < teacherCourses.length; i++) {
    map.name = teacherCourses[i].title;
    map.totalEnrollments = teacherCourses[i].enrolledStudents.length;
    singleCourseEnrollments.push(map);
    map = {};
  }

  //   Latest Reviews

  let reviews = [];
  for (let i = 0; i < teacherReviews.length; i++) {
    if (teacherReviews[i].reviews.length > 0) {
      reviews.push({
        title: teacherReviews[i].title,
        review: teacherReviews[i].reviews[0],
      });
    }
  }

  const analytics = {
    totalCourses: teacherCourses.length,
    totalEnrolledCourses,
    totalNotEnrolledCourses,
    totalEnrolledStudents,
    totalEarning,
    singleCourseEnrollments,
    reviews,
  };

  res.status(200).json({
    success: true,
    analytics,
  });
});
