import Activity from "../models/activity.js";
import ErrorHandler from "./Errorhandler.js";

export const userActivity = async (userId, title, content) => {
  try {
    await Activity.create({
      userId: userId,
      title: title,
      content: content,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
