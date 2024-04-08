import User from "../models/account/user.js";

// Creating token and saving in cookie
const sendToken = async (user, statusCode, res, message) => {
  const token = user.getJwtToken();

  // Options for cookies
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRY_DAY * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    user: user,
    token,
    message,
  });
};

export default sendToken;
