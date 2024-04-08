import Block from "../models/block.js";
import ErrorHandler from "../utils/Errorhandler.js";

export const blockUser = async (req, res, next) => {
  try {
    console.log("hello");
    const { blockTo } = req?.body; // Block to user id

    const existingUser = await Block.findOne({
      userId: req?.user?._id,
      blockTo: blockTo,
    });

    if (existingUser) {
      return next(new ErrorHandler("already blocked", 400));
    }

    await Block.create({ userId: req?.user?._id, blockTo: blockTo });

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
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
