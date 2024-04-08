import ErrorHandler from "../utils/Errorhandler.js";
import User from "../models/account/user.js";
import mongoose from "mongoose";

// Here i am fetching gender wise documents from users, connects and profiles collections
export const getGenderWiseUsersProfile = async (req, res, next) => {
  const { gender } = req.params; // Male or Female, This gives user gender

  let tempGender;
  if (gender === "Male") {
    tempGender = "Female";
  } else if (gender === "Female") {
    tempGender = "Male";
  }

  try {
    const profile = await User.aggregate([
      {
        $match: { gender: tempGender, regStatus: "Completed" },
      },
      {
        $project: {
          _id: 1,
          customId: 1,
          hideProfile: 1,
        },
      },
      {
        $match: {
          $or: [
            { "hideProfile.to": { $lte: Date.now() } },
            { "hideProfile.to": { $exists: false } },
          ],
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
            {
              $project: {
                _id: 1,
                profileFor: 1,
                email: 1,
                mobile: 1,
                gender: 1,
                customId: 1,
                role: 1,
                images: 1,
                createdAt: 1,
                privacy: 1,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $addFields: {
          "user.mobile": {
            $cond: {
              if: {
                $eq: [
                  "$user.privacy.mobile",
                  "showMobileOnlyToInterestSentOrAccept",
                ],
              },
              then: { $arrayElemAt: ["$user.mobile", 0] },
              else: {
                $cond: {
                  if: {
                    $eq: ["$user.privacy.mobile", "showMobileVisibleToAll"],
                  },
                  then: { $arrayElemAt: ["$user.mobile", 0] },
                  else: "870*****85",
                },
              },
            },
          },
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
        $lookup: {
          from: "careers",
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
          as: "career",
        },
      },
      {
        $lookup: {
          from: "families",
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
          as: "family",
        },
      },
      {
        $lookup: {
          from: "preferences",
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
          as: "preferences",
        },
      },
      {
        $lookup: {
          from: "connects",
          let: { docId: "$_id" },
          pipeline: [
            {
              $match: {
                $or: [
                  {
                    $expr: {
                      $and: [
                        { $eq: ["$senderId", "$$docId"] },
                        { $eq: ["$receiverId", req?.user?._id] },
                        // { $eq: ["$status", "accepted"] },
                      ],
                    },
                  },
                  {
                    $expr: {
                      $and: [
                        { $eq: ["$senderId", req?.user?._id] },
                        { $eq: ["$receiverId", "$$docId"] },
                        // { $eq: ["$status", "accepted"] },
                      ],
                    },
                  },
                ],
              },
            },
          ],
          as: "connect",
        },
      },
      {
        $limit: 20,
      },
    ]);

    if (!profile || profile.length === 0) {
      return next(new ErrorHandler("Profile not found", 404));
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const profile = await User.aggregate([
      {
        $match: { _id: req?.user?._id },
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
            {
              $project: {
                _id: 1,
                profileFor: 1,
                email: 1,
                mobile: 1,
                gender: 1,
                customId: 1,
                role: 1,
                images: 1,
                createdAt: 1,
              },
            },
          ],
          as: "user",
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
        $lookup: {
          from: "careers",
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
          as: "career",
        },
      },
      {
        $lookup: {
          from: "families",
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
          as: "family",
        },
      },

      {
        $lookup: {
          from: "preferences",
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
          as: "preferences",
        },
      },
    ]);

    if (!profile || profile.length === 0) {
      return next(new ErrorHandler("Profile not found", 404));
    }

    res.status(200).json({
      success: true,
      data: profile[0],
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getUserProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);
    const profile = await User.aggregate([
      {
        $match: { _id: objectId },
      },
      {
        $project: {
          _id: 1,
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
        $lookup: {
          from: "careers",
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
          as: "career",
        },
      },
      {
        $lookup: {
          from: "families",
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
          as: "family",
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
            {
              $project: {
                _id: 1,
                profileFor: 1,
                email: 1,
                mobile: 1,
                gender: 1,
                customId: 1,
                role: 1,
                images: 1,
                createdAt: 1,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "preferences",
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
          as: "preferences",
        },
      },
      {
        $lookup: {
          from: "connects",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $or: [
                  {
                    $expr: {
                      $and: [
                        { $eq: ["$senderId", "$$userId"] },
                        { $eq: ["$receiverId", req?.user?._id] },
                        // { $eq: ["$status", "accepted"] },
                      ],
                    },
                  },
                  {
                    $expr: {
                      $and: [
                        { $eq: ["$senderId", req?.user?._id] },
                        { $eq: ["$receiverId", "$$userId"] },
                        // { $eq: ["$status", "accepted"] },
                      ],
                    },
                  },
                ],
              },
            },
          ],
          as: "connect",
        },
      },
    ]);

    if (!profile || profile.length === 0) {
      return next(new ErrorHandler("Profile not found", 404));
    }

    res.status(200).json({
      success: true,
      data: profile[0],
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getNearByMatches = async (req, res, next) => {
  const { state, gender } = req.params; // State, This gives user state

  let tempGender;
  if (gender === "Male") {
    tempGender = "Female";
  } else if (gender === "Female") {
    tempGender = "Male";
  }

  try {
    const profile = await User.aggregate([
      {
        $match: { gender: tempGender, regStatus: "Completed" },
      },
      {
        $project: {
          _id: 1,
          customId: 1,
          hideProfile: 1,
        },
      },
      // {
      //   $match: {
      //     $or: [
      //       { "hideProfile.to": { $gt: Date.now() } }, // If hideProfile.to is greater than Date.now(), continue
      //       { "hideProfile.to": { $exists: false } }, // If hideProfile.to doesn't exist, continue
      //     ],
      //   },
      // },
      {
        $match: {
          $or: [
            { "hideProfile.to": { $lte: Date.now() } },
            { "hideProfile.to": { $exists: false } },
          ],
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
            {
              $project: {
                _id: 1,
                profileFor: 1,
                email: 1,
                mobile: 1,
                gender: 1,
                customId: 1,
                role: 1,
                images: 1,
                createdAt: 1,
                privacy: 1,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $addFields: {
          "user.mobile": {
            $cond: {
              if: {
                $eq: [
                  "$user.privacy.mobile",
                  "showMobileOnlyToInterestSentOrAccept",
                ],
              },
              then: { $arrayElemAt: ["$user.mobile", 0] },
              else: {
                $cond: {
                  if: {
                    $eq: ["$user.privacy.mobile", "showMobileVisibleToAll"],
                  },
                  then: { $arrayElemAt: ["$user.mobile", 0] },
                  else: "870*****85",
                },
              },
            },
          },
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
        $lookup: {
          from: "socials",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $and: [{ userId: { $ne: req?.user?._id } }, { state: state }],
              },
            },
          ],
          as: "social",
        },
      },
      {
        $lookup: {
          from: "careers",
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
          as: "career",
        },
      },
      {
        $lookup: {
          from: "families",
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
          as: "family",
        },
      },
      {
        $lookup: {
          from: "preferences",
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
          as: "preferences",
        },
      },
      {
        $lookup: {
          from: "connects",
          let: { docId: "$_id" },
          pipeline: [
            {
              $match: {
                $or: [
                  {
                    $expr: {
                      $and: [
                        { $eq: ["$senderId", "$$docId"] },
                        { $eq: ["$receiverId", req?.user?._id] },
                        // { $eq: ["$status", "accepted"] },
                      ],
                    },
                  },
                  {
                    $expr: {
                      $and: [
                        { $eq: ["$senderId", req?.user?._id] },
                        { $eq: ["$receiverId", "$$docId"] },
                        // { $eq: ["$status", "accepted"] },
                      ],
                    },
                  },
                ],
              },
            },
          ],
          as: "connect",
        },
      },
      {
        $limit: 20,
      },
    ]);

    if (!profile || profile.length === 0) {
      return next(new ErrorHandler("Profile not found", 404));
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
