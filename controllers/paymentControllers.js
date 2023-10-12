import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { instance } from "../server.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import { Earning } from "../models/Earnings.js";

export const checkout = catchAsyncErrors(async (req, res, next) => {
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "USD",
  };
  const order = await instance.orders.create(options);

  res.status(200).json({
    success: true,
    order,
  });
});

export const paymentVerfication = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const { courseId, userId } = req.query;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZOR_PAY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const user = await User.findOne({ _id: userId });
    const course = await Course.findOne({ _id: courseId });

    user.enrolledCourses.push(courseId);
    course.enrolledStudents.push(userId);

    await Earning.create({
      teacher: course.instructor,
      course: courseId,
      earningsAmount: course.price,
      transactionDate: Date.now(),
    });

    await user.save();
    await course.save();

    res.redirect(
      `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
});

export const getKey = (req, res, next) => {
  res.status(200).json({
    success: true,
    apiKey: process.env.RAZOR_PAY_KEY,
  });
};
