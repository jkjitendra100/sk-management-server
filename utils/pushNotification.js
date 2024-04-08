import Notification from "../models/notification.js";
import ErrorHandler from "./Errorhandler.js";

export const pushNotification = async (userId, title, content) => {
  try {
    await Notification.create({
      to: userId,
      title,
      content,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
