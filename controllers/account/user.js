import User from "../../models/account/user.js";
import ErrorHandler from "../../utils/Errorhandler.js";
import sendToken from "../../utils/sendToken.js";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
  deleteObject,
} from "firebase/storage";
import axios from "axios";
import { userActivity } from "../../utils/usersActivity.js";

// Send OTP
export const phoneLogin = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) return next(new ErrorHandler("Mobile no. is not valid", 400));

    const existingUser = await User.findOne({
      mobile: Number(mobile),
    });

    if (!existingUser)
      return next(new ErrorHandler(`"${mobile}" is not registered`, 404));

    let otp = Math.floor(1000 + Math.random() * 9000);

    const options = {
      method: "POST",
      url: "https://control.msg91.com/api/v5/flow/",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authkey: "413913ANVtFlMuX65a64ef1P1",
      },
      data: {
        template_id: "65c9844bd6fc0561ad7a7d92",
        short_url: "1 (On) or 0 (Off)",
        recipients: [{ mobiles: `91${mobile}`, otp: otp }],
      },
    };

    await axios
      .request(options)
      .then(function (response) {
        console.log(response.data, otp);
      })
      .catch(function (error) {
        console.error(error);
      });

    // Store OTP in db
    await User.findOneAndUpdate(
      { mobile: Number(mobile) },
      { otp: otp, otpValidity: Date.now() + 15 * 60 * 1000 },
      { runValidators: false }
    );

    res.status(201).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Verify OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const { otp, mobile } = req.body;

    if (!mobile) return next(new ErrorHandler("Mobile no. found", 400));
    if (!otp) return next(new ErrorHandler("OTP required", 400));

    const existingUser = await User.findOne({
      mobile: Number(mobile),
    });

    if (existingUser?.otp !== Number(otp)) {
      return next(new ErrorHandler("Wrong OTP", 400));
    }

    let validity =
      (Date.now() - Date.parse(existingUser?.otpValidity)) / (1000 * 60);
    if (validity > 15.0) {
      return next(new ErrorHandler(`OTP validity expired`, 400));
    }

    // Reg status  completed
    if (existingUser?.regStatus === "Completed") {
      userActivity(
        existingUser?._id,
        "Logged in",
        "User logged in successfully "
      );
      sendToken(existingUser, 200, res, "OTP verified successfully");
    }

    // Reg status not completed
    if (existingUser?.regStatus !== "Completed") {
      const user = await User.findOneAndUpdate(
        { mobile: Number(mobile) },
        {
          otpVerified: true,
          mobileVerified: true,
          regStatus: existingUser?.regStatus ? existingUser?.regStatus : "ID",
        },
        { new: true, runValidators: false }
      );
      userActivity(
        existingUser?._id,
        "Mobile no. updated",
        "User's mobile no. updated successfully"
      );
      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        data: {
          _id: existingUser?._id,
          regStatus: user?.regStatus ? user?.regStatus : "ID",
        },
      });
    }
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Get user details
export const getUserDetails = async (req, res, next) => {
  try {
    const profile = await User.aggregate([
      {
        $match: { _id: req?.user?._id },
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
                $expr: {
                  $eq: ["$receiverId", "$$userId"],
                },
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
      message: "Profiles found",
      user: profile[0],
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const getUserDetailsByCustomId = async (req, res, next) => {
  try {
    const { customId } = req?.params;
    const profile = await User.aggregate([
      {
        $match: { customId: { $eq: Number(customId) } },
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
                $expr: {
                  $eq: ["$receiverId", "$$userId"],
                },
              },
            },
          ],
          as: "connect",
        },
      },
      {
        $lookup: {
          from: "shortlists",
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
          as: "shortlist",
        },
      },
    ]);

    if (!profile || profile.length === 0) {
      return next(new ErrorHandler("Profile not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profiles found",
      user: profile[0],
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { profileFor, mobile, email } = req.body;
    const newUpdatedData = { profileFor, mobile, email };

    const user = await User.findByIdAndUpdate(req.user._id, newUpdatedData, {
      new: true,
      runValidators: true,
      useFindAndUpdate: false,
    });

    res
      .status(200)
      .send({ success: true, message: "Profile updated successfully" });

    // We will add firebase letter
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { pageNo } = req?.params;
    let limit = 10;
    let skip = (Number(pageNo) - 1) * limit;

    const usersCount = await User.aggregate([
      {
        $match: {
          regStatus: "Completed",
          $or: [{ referralId: { $exists: false } }],
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
          $or: [
            { referralId: { $exists: true, $ne: null } },
            { referralId: { $exists: false } },
          ],
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
    return next(new ErrorHandler(e.message, 500));
  }
};

// Get single user
export const getSingleUsers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return next(new ErrorHandler("User not found", 400));

    res.status(200).send({ success: true, user });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Update user role
export const updateRole = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const newUpdatedData = { email, role };

    const user = await User.findByIdAndUpdate(req.params.id, newUpdatedData, {
      new: true,
      runValidators: true,
      useFindAndUpdate: false,
    });

    if (!user) return next(new ErrorHandler("User not found", 404));

    res
      .status(200)
      .send({ success: true, user, message: "Profile updated successfully" });

    // We will remove firebase letter
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Upload photos
export const uploadPhotos = async (req, res, next) => {
  try {
    const userId = req.params?.userId || req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const images = req.files;
    const storage = getStorage();

    if (!images || images.length === 0) {
      // Update reg status
      if (user?.regStatus === "Photos") {
        user.regStatus = "Congrats";
        await user.save();
      }
      res.status(200).json({
        success: true,
        // user: updatedUser,
        message: "Images uploaded skipped",
      });
    }

    let imagesList = [];

    // Use Promise.all to wait for all asynchronous calls to complete
    await Promise.all(
      images.map(async (image, index) => {
        const fileName = `userProfiles/${userId?.toString()}/${Date.now()?.toString()}`;
        const metadata = {
          contentType: image.mimetype,
        };
        // Upload file and metadata to the object 'images/mountains.jpg'
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(
          storageRef,
          image.buffer,
          metadata
        );

        try {
          // Wait for the upload to complete
          await uploadTask;

          // Get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          // Push image details to the imagesList array
          imagesList.push({
            docPath: fileName,
            docUrl: downloadURL,
          });

          // update photos in database
        } catch (error) {
          console.error("Error uploading: ", error);
        }
      })
    );

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        images: [...imagesList, ...user?.images],
      },
      { new: true, runValidators: true }
    );

    // Update reg status
    if (user?.regStatus === "Photos") {
      user.regStatus = "Congrats";
      await user.save();
    }
    res.status(200).json({
      success: true,
      // user: updatedUser,
      message: "Images uploaded successfully",
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Get user photos
export const getMyPhotos = async (req, res, next) => {
  try {
    const profile = await User.findById(req?.user?._id);

    if (!profile || profile.length === 0) {
      return next(new ErrorHandler("Profile not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profiles found",
      data: profile?.images,
    });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    const user = await User.findById(req?.user?._id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const fileId = req.params?.id;
    const fileObject = user?.images?.find((e) => e?._id == fileId);
    if (!fileObject) return next(new ErrorHandler("File not found", 404));

    const storage = getStorage();
    const imageRef = ref(storage, fileObject?.docPath);
    // Delete file from cloud storage
    deleteObject(imageRef)
      .then(async () => {
        const userImages = user?.images;
        let updatedImages = userImages?.filter(
          (e) => e?._id !== fileObject?._id
        );

        user.images = updatedImages;
        await user?.save();

        res.status(200).json({
          success: true,
          message: "File deleted successfully",
          images: updatedImages,
        });
      })
      .catch((e) => {
        return next(new ErrorHandler(e?.message, 500));
      });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};
