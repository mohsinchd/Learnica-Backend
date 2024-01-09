import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { instance } from "../server.js";
import crypto from "crypto";
import { Course } from "../models/Course.js";
import { Earning, AdminEarning } from "../models/Earnings.js";
import { Cart } from "../models/Cart.js";

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

    let totalCoursePrice = course.price;

    let adminEarn = totalCoursePrice * 0.2;
    let teacherEarn = totalCoursePrice * 0.8;

    user.enrolledCourses.push(courseId);
    course.enrolledStudents.push(userId);

    await Earning.create({
      teacher: course.instructor,
      course: courseId,
      earningsAmount: teacherEarn,
      transactionDate: Date.now(),
    });

    await AdminEarning.create({
      student: userId,
      course: courseId,
      earningsAmount: adminEarn,
      transactionDate: Date.now(),
    });

    await user.save();
    await course.save();

    res.redirect(
      `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
    );
  } else {
    res.status(400).json({
      success: false,
    });
  }
});

export const multipleVerfication = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const { courseId, userId } = req.query;

  let idsArr = courseId.split(",");

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZOR_PAY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const user = await User.findOne({ _id: userId });
    const courses = await Course.find({ _id: { $in: idsArr } });

    user.enrolledCourses.push(...idsArr);
    const updateResult = await Course.updateMany(
      { _id: { $in: idsArr } }, // Filter by course IDs
      { $addToSet: { enrolledStudents: userId } } // Add student ID to enrolledStudents (avoid duplicates)
    );

    for (let i = 0; i < idsArr.length; i++) {
      const course = await Course.findOne({ _id: idsArr[i] });
      const totalCoursePrice = course.price;

      let teacherEarn = totalCoursePrice * 0.8;
      let adminEarn = totalCoursePrice * 0.2;

      await Earning.create({
        teacher: course.instructor,
        course: course._id,
        earningsAmount: teacherEarn,
        transactionDate: Date.now(),
      });

      await AdminEarning.create({
        student: userId,
        course: course._id,
        earningsAmount: adminEarn,
        transactionDate: Date.now(),
      });
    }

    await Cart.findOneAndRemove({ user: userId });

    await user.save();

    res.redirect(
      `${process.env.FRONTEND_URL}/paymentsuccess?reference=${razorpay_payment_id}`
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
