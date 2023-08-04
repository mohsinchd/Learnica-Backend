export const sendToken = (res, user, message, statusCode = 200) => {
  // Get JWT Token
  const token = user.getJWTToken();
  // Cookie Options

  let options = {
    httpOnly: true,
    expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    sameSite: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    message,
    user,
  });
};
