import User from "../models/account/user.js";
import AssignedUsers from "../models/assignedUsers.js";
import ErrorHandler from "../utils/Errorhandler.js";

export const assignNewUser = async (req, res, next) => {
  try {
    const { userId } = req?.body; // Block to user id

    const existingUser = await AssignedUsers.findOne({
      employeeId: req?.user?._id,
      userId: userId,
    });

    if (existingUser) {
      return next(new ErrorHandler("User is already assigned", 404));
    }

    await AssignedUsers.create({ userId, employeeId: req?.user?._id });
    await User.findByIdAndUpdate(
      userId,
      { referralId: req?.user?.customId },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "User assigned successfully",
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getAllMyAssignedUsers = async (req, res, next) => {
  try {
    const { pageNo } = req?.params;
    let limit = 10;
    let skip = (Number(pageNo) - 1) * limit;

    console.log(req?.user?.customId.toString());

    const usersCount = await User.aggregate([
      {
        $match: {
          regStatus: "Completed",
          referralId: (req?.user?.customId).toString(),
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }, // Count documents
        },
      },
    ]);

    const users = await User.aggregate([
      {
        $match: {
          regStatus: "Completed",
          referralId: (req?.user?.customId).toString(),
        },
      },
      {
        $project: {
          _id: 1,
        },
      },
      {
        $lookup: {
          from: "users",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"],
                },
              },
            },
          ],
          as: "user",
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
        },
      },
      {
        $lookup: {
          from: "profiles",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$userId"],
                },
              },
            },
          ],
          as: "profile",
        },
      },
      {
        $addFields: {
          profile: { $arrayElemAt: ["$profile", 0] },
        },
      },
      {
        $lookup: {
          from: "socials",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$userId", "$$userId"],
                },
              },
            },
          ],
          as: "social",
        },
      },
      {
        $addFields: {
          social: { $arrayElemAt: ["$social", 0] },
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.status(200).send({
      success: true,
      data: users,
      usersCount: usersCount.length > 0 ? usersCount[0].count : 0,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
