import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";

// Add New Section in the course -> Private
export const addNewSection = catchAsyncErrors(async (req, res, next) => {
  const { title } = req.body;
  const { id } = req.params;

  if (!title) {
    return next(new ErrorHandler("Section Title is Required.", 400));
  }

  const course = await Course.findById(id);

  if (!course) {
    return next(new ErrorHandler("Course not found with the given ID.", 404));
  }

  const section = {
    title,
    lectures: [],
  };

  course.sections.push(section);

  await course.save();

  res.status(200).json({
    success: true,
    message: "Section Successfully Added into the course.",
  });
});

// Get all lectures from the section -> Private
export const getAllLectures = catchAsyncErrors(async (req, res, next) => {
  const { courseId, sectionId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("No Course found with the given ID.", 404));
  }

  const section = course.sections.id(sectionId);

  if (!section) {
    return next(new ErrorHandler("No Section Exists with the given ID.", 404));
  }

  res.status(200).json({
    success: true,
    lectures: section.lectures,
  });
});

// Update the section in the course -> Private
export const updateCourseSection = catchAsyncErrors(async (req, res, next) => {
  const { courseId, sectionId } = req.params;
  const { title } = req.body;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("No Course found with the given ID.", 404));
  }

  const sectionToUpdate = course.sections.id(sectionId);

  if (!sectionToUpdate) {
    return next(new ErrorHandler("No Section Exists with the given ID.", 404));
  }

  if (title) {
    sectionToUpdate.title = title;
  }

  await course.save();

  res.status(200).json({
    success: true,
    message: "Section Updated.",
  });
});

// Add Lectures in the section -> Private
export const addLectures = catchAsyncErrors(async (req, res, next) => {
  const { courseId, sectionId } = req.params;

  const { title } = req.body;
  const file = req.file;

  if (!title || !file) {
    return next(
      new ErrorHandler("Lecture title and Lecture video is required", 400)
    );
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("No Course found with the given id.", 404));
  }

  const sectionToUpdate = course.sections.id(sectionId);

  if (!sectionToUpdate) {
    return next(new ErrorHandler("No Section Exists with the given ID.", 404));
  }

  // Upload Lecture to cloudinary
  const fileUri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "video",
  });

  sectionToUpdate.lectures.push({
    title,
    video: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture added successfully.",
  });
});

// Delete Section -> Private
export const deleteSection = catchAsyncErrors(async (req, res, next) => {
  const { courseId, sectionId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("No Course exists with the given ID.", 404));
  }

  const sectionToUpdate = course.sections.id(sectionId);

  if (!sectionToUpdate) {
    return next(new ErrorHandler("No section exists with the given ID.", 404));
  }

  for (let i = 0; i < sectionToUpdate.lectures.length; i++) {
    let singleLecture = sectionToUpdate.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id, {
      resource_type: "video",
    });
  }

  course.sections = course.sections.filter(
    (section) => section._id.toString() !== sectionToUpdate._id.toString()
  );

  await course.save();

  res.status(200).json({
    success: true,
    message: "Section deleted Successfully",
  });
});

// Get all sections -> Private.
export const getAllSections = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const course = await Course.findById(id);
  if (!course) {
    return next(new ErrorHandler("No Course Exists with the given ID.", 404));
  }
  res.status(200).json({
    success: true,
    sections: course.sections,
  });
});

// Update Single Lecture -> PRIVATE
export const updateLecture = catchAsyncErrors(async (req, res, next) => {
  const { courseId, sectionId, lectureId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("No Course found with the given ID.", 404));
  }

  const courseSection = course.sections.id(sectionId);

  if (!courseSection) {
    return next(
      new ErrorHandler("No course section exist with the given ID.", 404)
    );
  }

  const courseLecture = courseSection.lectures.id(lectureId);
  if (!courseLecture) {
    return next(new ErrorHandler("No Lecture with the given ID.", 404));
  }

  const { title } = req.body;
  const file = req.file;

  if (title) {
    courseLecture.title = title;
  }

  if (file) {
    const fileUri = getDataUri(file);
    await cloudinary.v2.uploader.destroy(courseLecture.video.public_id, {
      resource_type: "video",
    });
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
      resource_type: "video",
    });

    courseLecture.video.public_id = myCloud.public_id;
    courseLecture.video.url = myCloud.secure_url;
  }

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture updated successfully",
  });
});

// Delete lecture -> Private
export const deleteLecture = catchAsyncErrors(async (req, res, next) => {
  const { courseId, sectionId, lectureId } = req.params;

  const course = await Course.findById(courseId);

  if (!course) {
    return next(new ErrorHandler("No Course found with the given ID.", 404));
  }

  const courseSection = course.sections.id(sectionId);

  if (!courseSection) {
    return next(
      new ErrorHandler("No course section exist with the given ID.", 404)
    );
  }

  const courseLecture = courseSection.lectures.id(lectureId);
  if (!courseLecture) {
    return next(new ErrorHandler("No Lecture with the given ID.", 404));
  }

  await cloudinary.v2.uploader.destroy(courseLecture.video.public_id, {
    resource_type: "video",
  });

  courseSection.lectures = courseSection.lectures.filter(
    (lecture) => lecture._id.toString() !== courseLecture._id.toString()
  );

  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture removed successfully",
  });
});
