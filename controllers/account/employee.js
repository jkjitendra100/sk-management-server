import Employee from "../../models/account/employee.js";
import ErrorHandler from "../../utils/Errorhandler.js";
import sendToken from "../../utils/sendToken.js";
import axios from "axios";
import { userActivity } from "../../utils/usersActivity.js";

export const registerEmployee = async (req, res, next) => {
  try {
    // Generating OTP
    let tempOtp = Math.floor(1000 + Math.random() * 9000);
    const { name, mobile, gender, aadhaarNo, panNo } = req.body;

    const existingUser = await Employee.findOne({ mobile });
    let generatedId = Math.floor(100000 + Math.random() * 900000);

    let user;
    if (!existingUser) {
      user = await Employee.create({
        name,
        mobile,
        gender,
        customId: generatedId,
        aadhaarNo,
        panNo,
        otp: tempOtp,
        otpValidity: Date.now() + 15 * 60 * 1000,
      });
    }

    if (existingUser) {
      await Employee.findOneAndUpdate(
        { mobile: Number(mobile) },
        { otp: tempOtp, otpValidity: Date.now() + 15 * 60 * 1000 },
        { runValidators: false }
      );
    }

    // Send otp to user
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
        recipients: [{ mobiles: `91${mobile}`, otp: tempOtp }],
      },
    };

    await axios
      .request(options)
      .then(function (response) {
        console.log(tempOtp);
        res.status(201).json({
          success: true,
          message: "User data saved successfully",
          user: { _id: existingUser?._id, mobile },
        });
      })
      .catch(function (error) {
        return next(new ErrorHandler(error.message, 500));
      });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

export const getEmployeeByCustomId = async (req, res, next) => {
  try {
    const { customId } = req?.body;

    const user = await Employee.findOne({ customId });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};

// Send OTP
export const phoneLogin = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) return next(new ErrorHandler("Mobile no. is not valid", 400));

    const existingUser = await Employee.findOne({
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
    await Employee.findOneAndUpdate(
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

    const existingUser = await Employee.findOne({
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

    // Reg status not completed
    const user = await Employee.findOneAndUpdate(
      { mobile: Number(mobile) },
      {
        otpVerified: true,
        mobileVerified: true,
      },
      { new: true, runValidators: false }
    );

    sendToken(existingUser, 200, res, "OTP verified successfully");
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

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const { profileFor, mobile, email } = req.body;
    const newUpdatedData = { profileFor, mobile, email };

    const user = await Employee.findByIdAndUpdate(
      req.user._id,
      newUpdatedData,
      {
        new: true,
        runValidators: true,
        useFindAndUpdate: false,
      }
    );

    res
      .status(200)
      .send({ success: true, message: "Profile updated successfully" });

    // We will add firebase letter
  } catch (e) {
    return next(new ErrorHandler(e.message, 500));
  }
};
