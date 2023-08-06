import ErrorHandler from "../utils/errorHandler.js";

// Not Found Middleware
export const notFound = (req, res, next) => {
  return next(new ErrorHandler(`Resource not found: ${req.originalUrl}`, 404));
};

// Error Middleware
export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
