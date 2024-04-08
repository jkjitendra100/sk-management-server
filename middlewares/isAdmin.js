import jwt from "jsonwebtoken";
import ErrorHandler from "../utils/Errorhandler.js";
import User from "../models/account/user.js";

export default async function isAdmin(req, res, next) {
  try {
    const { token } = req.cookies;

    if (!token) {
      return next(
        new ErrorHandler("User is not logged in, please login first", 400)
      );
    }
    const { id } = jwt.verify(token, process.env.JET_SECRET);
    const user = await User.findById(id);

    if (user?.role !== "admin") {
      return next(
        new ErrorHandler("This action can be accessed by admin only", 400)
      );
    }

    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
