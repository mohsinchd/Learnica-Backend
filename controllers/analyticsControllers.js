import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import { Course } from "../models/Course.js";
import { AdminEarning, Earning } from "../models/Earnings.js";
import { User } from "../models/User.js";

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

// Admin Analytics
export const getAdminAnalytics = catchAsyncErrors(async (req, res, next) => {
  console.log(req.user._id);

  const teacherCourses = await Course.find();
  const adminEarning = await AdminEarning.find();
  const users = await User.find();
  const courseReviews = await Course.find()
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

  // Total Earning to a Teacher
  const totalEarning = adminEarning.reduce(
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
  for (let i = 0; i < courseReviews.length; i++) {
    if (courseReviews[i].reviews.length > 0) {
      reviews.push({
        title: courseReviews[i].title,
        review: courseReviews[i].reviews[0],
      });
    }
  }

  const analytics = {
    totalCourses: teacherCourses.length,
    totalEnrolledCourses,
    totalNotEnrolledCourses,
    totalEarning,
    singleCourseEnrollments,
    reviews,
    totalUsers: users.length,
  };

  res.status(200).json({
    success: true,
    analytics,
  });
});

///////////////////////////////////////////
///////////////////////////////////////////
//////////////////////////////////////////

// ALL USERS - ADMIN
export const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find({ _id: { $ne: req.user._id } });

  res.status(200).json({
    success: true,
    users,
  });
});

// Single User - Admin
export const getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate(
    "enrolledCourses",
    "poster title averageRating numOfReviews price"
  );
  if (!user) {
    return next(new ErrorHandler("User Not Found.", 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Delete User - Admin
export const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler("User Not Found.", 404));
  }

  // Cancel the Enrollment
  for (let i = 0; i < user.enrolledCourses.length; i++) {
    cancelEnrollment(user.enrolledCourses[i], user._id);
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});

// Enrollment Cancel Handler
async function cancelEnrollment(courseId, studentId) {
  const course = await Course.findById(courseId);

  course.enrolledStudents = course.enrolledStudents.filter(
    (student) => student.toString() !== studentId.toString()
  );

  course.reviews = course.reviews.filter(
    (review) => review.user.toString() !== studentId.toString()
  );

  course.numOfReviews = course.reviews.length;

  const totalRating = course.reviews.reduce((acc, rev) => rev.rating + acc, 0);

  course.averageRating = totalRating / course.reviews.length;

  await course.save();
}

// All Courses - Admin
export const getAllCourses = catchAsyncErrors(async (req, res, next) => {
  const courses = await Course.find().select("-sections -description");
  res.status(200).json({
    success: true,
    courses,
  });
});

// Get Single Course - Admin
export const getSingleCourse = catchAsyncErrors(async (req, res, next) => {
  // Get the course ID from the request parameters
  const courseId = req.params.id;

  // Find all admin earnings for the specified course
  const adminEarnings = await AdminEarning.find({ course: courseId });
  const course = await Course.findById(courseId)
    .select("-description -sections")
    .populate("instructor", "name email avatar createdAt role") // Populate instructor details
    .populate("enrolledStudents", "name email avatar")
    .populate({
      path: "reviews",
      select: "user rating comment",
      populate: {
        path: "user",
        select: "avatar name",
      },
    }); // Populate enrolled students' details

  let totalEarning = adminEarnings.reduce(
    (acc, trans) => trans.earningsAmount + acc,
    0
  );

  // Create an array of month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Create a dictionary to store transaction counts for each month
  const monthlyTransactionCounts = {};

  // Loop through admin earnings to count transactions by month
  adminEarnings.forEach((earning) => {
    const transactionDate = new Date(earning.transactionDate);
    const transactionMonth = monthNames[transactionDate.getMonth()]; // Get month name

    if (!monthlyTransactionCounts[transactionMonth]) {
      monthlyTransactionCounts[transactionMonth] = 1;
    } else {
      monthlyTransactionCounts[transactionMonth]++;
    }
  });

  let analytics = {
    report: monthlyTransactionCounts,
    totalEnrollements: adminEarnings.length,
    totalEarning,
    course,
  };

  // Return the report as a JSON response
  return res.status(200).json({ success: true, analytics });
});
