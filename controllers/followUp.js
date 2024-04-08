import FollowUp from "../models/followUp.js";
import ErrorHandler from "../utils/Errorhandler.js";

export const addFollowUp = async (req, res, next) => {
  try {
    const { userId, title, message, status, nextFollowUpDate } = req?.body;

    await FollowUp.create({
      userId,
      employeeId: req?.user?._id,
      title,
      message,
      status,
      nextFollowUpDate,
    });

    res.status(200).json({
      success: true,
      message: "FollowUp added successfully",
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getUserFollowUps = async (req, res, next) => {
  try {
    const { userId } = req?.params;

    const followUps = await FollowUp.find({ userId });

    if (!followUps || followUps.length === 0) {
      return next(
        new ErrorHandler("This user does not have any followUp", 404)
      );
    }

    res.status(200).json({
      success: true,
      data: followUps,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
