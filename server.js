import app from "./app.js";
import { config } from "dotenv";
import { connectDB } from "./config/connectDb.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";

// Uncaught Rejections
process.on("uncaughtException", (error) => {
  console.log(`Shutting down the server due to uncaught error`);
  console.log(`Error: ${error.message}`);
  process.exit(1);
});

// Dotenv Configuration
config({
  path: "./config/config.env",
});

// Database connection
connectDB();

// Razor Pay configuration
export const instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});

server.timeout = 300000;

// Unhandled Promise Rejections
process.on("unhandledRejection", (error) => {
  console.log(`Error: ${error.message}`);
  console.log(`Shutting down the server due to Unhandled Promise Rejection`);
  server.close(() => {
    process.exit(1);
  });
});
