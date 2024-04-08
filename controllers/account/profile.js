import ErrorHandler from "../../utils/Errorhandler.js";
import Profile from "../../models/account/profile.js";
import User from "../../models/account/user.js";

export const createProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      birthTime,
      birthPlace,
      height,
      manglikStatus,
      horoscopeMatch,
      regStatus,
      userId,
      // For user collection
      profileFor,
      gender,
    } = req.body;

    // Check weather user profile exists or not
    const profileExists = await Profile.findOne({ userId: userId });
    if (profileExists) {
      res.status(200).json({
        success: true,
        message: "Profile already exists",
      });
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(
        new ErrorHandler(`User ID - ${userId} does not exists!`, 400)
      );
    }

    if (user.regStatus !== "Profile") {
      return next(new ErrorHandler("Verify your identity first", 400));
    }

    let userProfile = await Profile.create({
      firstName,
      lastName,
      dob,
      birthTime,
      birthPlace,
      height,
      manglikStatus,
      horoscopeMatch,
      userId: userId,
    });

    await User.findByIdAndUpdate(userId, {
      regStatus: regStatus,
      profileFor: profileFor,
      gender: gender,
    }).exec();
    // user.regStatus = regStatus;
    // user.profileFor = profileFor;
    // user.gender = gender;
    // await user.save();

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      // data: userProfile,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      birthTime,
      birthPlace,
      height,
      manglikStatus,
      horoscopeMatch,
      about,
    } = req.body;

    // Check weather user profile exists or not
    const profileExists = await Profile.findOne({ userId: req?.user?._id });

    let userProfile;
    if (!profileExists) {
      return next(new ErrorHandler("User profile not found", 404));
    }

    userProfile = await Profile.findOneAndUpdate(
      { userId: req?.user?._id },
      {
        firstName,
        lastName,
        dob,
        birthTime,
        birthPlace,
        height,
        manglikStatus,
        horoscopeMatch,
        about,
        userId: req?.user?._id,
      },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: "Profile updated successfully",
      data: userProfile,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const updateAstro = async (req, res, next) => {
  try {
    const { birthState, birthCity, birthPlace, birthTime } = req.body;

    // Check weather user profile exists or not
    const profileExists = await Profile.findOne({ userId: req?.user?._id });

    let userProfile;
    if (!profileExists) {
      return next(new ErrorHandler("User profile not found", 404));
    }

    userProfile = await Profile.findOneAndUpdate(
      { userId: req?.user?._id },
      {
        birthState,
        birthCity,
        birthPlace,
        birthTime,
      },
      { new: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: "Astro updated successfully",
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const getProfileDetails = async (req, res, next) => {
  try {
    console.log(req?.user?._id);

    const profile = await Profile.findOne({ userId: req?.user?._id });

    if (!profile) {
      return next(new ErrorHandler("Profile details not found", 404));
    }
    res
      .status(200)
      .json({ success: true, message: "Profile details found", data: profile });
  } catch (e) {
    return next(new ErrorHandler(e?.message, 500));
  }
};
