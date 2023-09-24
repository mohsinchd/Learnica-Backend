import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/errorHandler.js";
import ApiFeatures from "../utils/apiFeatures.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";

// Get all courses - Public
export const getAllCourses = catchAsyncErrors(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(
    Course.find().populate("instructor", "name email"),
    req.query
  )
    .search()
    .searchCategory()
    .filter()
    .pagination(6);

  const courses = await apiFeatures.query;

  const noOfCourses = await Course.countDocuments();

  res.status(200).json({
    success: true,
    courses,
    noOfCourses,
  });
});

// Get single Course details - Pubic
export const getCourseDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .select("-sections.lectures.video")
    .populate("instructor", "name email avatar")
    .populate({
      path: "reviews",
      select: "rating comment user",
      populate: {
        path: "user",
        select: "avatar name",
      },
    });

  if (!course) {
    return next(new ErrorHandler("No Course Found with the given Id.", 404));
  }

  res.status(200).json({
    success: true,
    course,
  });
});

// Get Instructor's Courses - Private
export const getInstructorCourses = catchAsyncErrors(async (req, res, next) => {
  const courses = await Course.find({ instructor: req.user._id });

  res.status(200).json({
    success: true,
    courses,
  });
});

// Create New Course - Private
export const createNewCourse = catchAsyncErrors(async (req, res, next) => {
  const { title, description, category, price, preReq, courseFor } = req.body;

  const file = req.file;

  if (!title || !description || !file || !category || !price) {
    return next(
      new ErrorHandler(
        "Title , Description , Thumbnail , Category , Price are required fields",
        400
      )
    );
  }

  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  await Course.create({
    title,
    description,
    price,
    category,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    instructor: req.user._id,
    preReq,
    courseFor,
  });

  res.status(201).json({
    success: true,
    message: "Course Created Successfully",
  });
});

// Update Course - Private
export const updateCourse = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    return next(new ErrorHandler("No Course Found with the given Id.", 404));
  }

  const { title, description, category, price, preReq, courseFor } = req.body;
  const file = req.file;

  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (price) course.price = Number(price);
  if (file) {
    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    course.poster = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  if (preReq) course.preReq = preReq;
  if (courseFor) course.courseFor = courseFor;

  await course.save();

  res.status(200).json({
    success: true,
    message: "Course Updated successfully",
  });
});

// Delete Course -> Private
export const deleteCourse = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);

  if (!course) {
    return next(new ErrorHandler("No Course exists with the given ID.", 404));
  }

  await cloudinary.v2.uploader.destroy(course.poster.public_id);

  // Collect public_ids of all videos using flatMap and Set
  const videoPublicIds = [
    ...new Set(
      course.sections.flatMap((section) =>
        section.lectures.map((lecture) => lecture.video.public_id)
      )
    ),
  ];

  // Delete videos from Cloudinary
  for (const public_id of videoPublicIds) {
    await cloudinary.v2.uploader.destroy(public_id, {
      resource_type: "video",
    });
  }

  await Course.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Course Deleted Successfully.",
  });
});

// Create Course Review or Update the existing..
export const createCourseReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, courseId } = req.body;

  if (!rating || !comment) {
    return next(new ErrorHandler("Rating and Comment is Required.", 400));
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const course = await Course.findById(courseId);

  const isReviewed = course.reviews.find(
    (rev) => rev.user._id.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    course.reviews.forEach((rev) => {
      if (rev.user._id.toString() === req.user._id.toString()) {
        rev.rating = rating;
        rev.comment = comment;
      }
    });
  } else {
    course.reviews.push(review);
    course.numOfReviews = course.reviews.length;
  }

  let avgRating = course.reviews.reduce((acc, el) => acc + el.rating, 0);

  course.averageRating = avgRating / course.reviews.length;

  await course.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Review Added Successfully",
  });
});

// Get All Reviews
export const getAllReviews = catchAsyncErrors(async (req, res, next) => {
  const { courseId } = req.query;

  const course = await Course.findById(courseId).populate({
    path: "reviews",
    select: "user rating comment",
    populate: {
      path: "user",
      select: "avatar name",
    },
  });

  if (!course) {
    return next(new ErrorHandler("No Course Exists with the Given Id.", 404));
  }

  res.status(200).json({
    success: true,
    reviews: course.reviews,
  });
});

// Delete Review
export const deleteReview = catchAsyncErrors(async (req, res, next) => {
  const { courseId, reviewId } = req.query;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("No Course Exists with the Given Id.", 404));
  }

  const reviews = course.reviews.filter(
    (rev) => rev._id.toString() !== reviewId.toString()
  );

  let avgRating = reviews.reduce((acc, el) => acc + el.rating, 0);

  avgRating = avgRating / reviews.length;

  const numOfReviews = reviews.length;

  await Course.findByIdAndUpdate(
    courseId,
    {
      reviews,
      averageRating: avgRating,
      numOfReviews,
    },
    {
      new: true,
    }
  );

  res.status(200).json({
    success: true,
  });
});
