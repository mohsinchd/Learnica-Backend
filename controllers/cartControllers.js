import { Cart } from "../models/Cart.js";
import { Course } from "../models/Course.js";
import ErrorHandler from "../utils/errorHandler.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";

// Add To the Cart
export const addToCart = catchAsyncErrors(async (req, res, next) => {
  const { courseId } = req.body;

  if (!courseId) {
    return next(new ErrorHandler("Course Id is required.", 400));
  }

  const course = await Course.findById(courseId);

  if (!course) {
    return res.status(404).json({ error: "Course not found" });
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({ user: req.user._id, courses: [] });
  }

  //   Check if course is already present in the cart

  const isExists = cart.courses.find(
    (course) => course._id.toString() === courseId.toString()
  );

  if (isExists) {
    cart.courses.map((course) => {
      if (course._id.toString() === courseId.toString()) {
        return course._id;
      } else {
        return courseId;
      }
    });
  } else {
    cart.courses.push(courseId);
  }

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Added to the Cart.",
  });
});

// Get cart Items
export const getCartItems = catchAsyncErrors(async (req, res, next) => {
  //   const cartItems = await Cart.findOne({ user: req.user._id }).populate(
  //     "courses",
  //     "title poster price instructor"
  //   );

  const cartItems = await Cart.findOne({ user: req.user._id }).populate({
    path: "courses",
    select: "title poster price averageRating numOfReviews instructor", // Select the fields you want from the course
    populate: {
      path: "instructor",
      model: "User", // Assuming 'Instructor' is the model name for instructors
      select: "name email", // Select the fields you want from the instructor
    },
  });

  if (!cartItems) {
    return next(new ErrorHandler("No Items in the Cart.", 404));
  }

  res.status(200).json({
    success: true,
    cartItems,
  });
});

// Remove from the cart
export const removeFromCart = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;

  // Filter the cart items

  let cart = await Cart.findOne({ user: req.user._id });

  let newItems = cart.courses.filter(
    (course) => course.toString() !== id.toString()
  );

  cart.courses = newItems;

  await cart.save();

  res.status(200).json({
    success: true,
    message: "Item Removed.",
  });
});
