import User from "../models/account/user.js";
import Block from "../models/block.js";
import ErrorHandler from "../utils/Errorhandler.js";

export const getRegisteredUsersCount = async (req, res, next) => {
  try {
    const usersCount = await User.countDocuments({ regStatus: "Completed" });

    res.status(200).json({
      success: true,
      data: usersCount,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getAllMyBlockedUsers = async (req, res, next) => {
  try {
    const allMyBlockedUsers = await Block.find({ userId: req?.user?._id });

    res.status(200).json({
      success: true,
      data: AllMyBlockedUsers,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
