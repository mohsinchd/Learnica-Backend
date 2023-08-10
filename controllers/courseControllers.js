import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/errorHandler.js";
import ApiFeatures from "../utils/apiFeatures.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";

// Get all courses - Public
export const getAllCourses = catchAsyncErrors(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(Course.find(), req.query)
    .search()
    .searchCategory()
    .filter()
    .pagination(10);

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

  const course = await Course.findById(id).select("-sections.lectures.video");

  if (!course) {
    return next(new ErrorHandler("No Course Found with the given Id.", 404));
  }

  res.status(200).json({
    success: true,
    course,
  });
});

// Create New Course - Private
export const createNewCourse = catchAsyncErrors(async (req, res, next) => {
  const { title, description, category, price } = req.body;

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

  const { title, description, category, price } = req.body;
  const file = req.file;

  if (title) course.title = title;
  if (description) course.description = description;
  if (category) course.category = category;
  if (price) course.price = price;
  if (file) {
    await cloudinary.v2.uploader.destroy(course.poster.public_id);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);
    course.poster = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

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
