export const sendToken = (res, user, message, statusCode = 200) => {
  // Get JWT Token
  const token = user.getJWTToken();

  res.status(statusCode).json({
    success: true,
    message,
    user: {
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      enrolledCourses: user.enrolledCourses,
      role: user.role,
      createdAt: user.createdAt,
      token,
    },
  });
};
