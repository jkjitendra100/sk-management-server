import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Full name required"],
  },

  mobile: {
    type: Number,
    unique: true,
    required: [true, "Please enter mobile number"],
    minLength: [10, "Mobile no. must be of 10 digits"],
    maxLength: [10, "Mobile no. must be of 10 digits"],
  },

  gender: {
    type: String,
    enum: ["Male", "Female"],
  },

  customId: {
    type: Number,
    unique: true,
  },

  status: {
    type: String,
    default: "active",
    enum: ["active", "hide", "disabled"],
  },

  role: {
    type: String,
    enum: [
      "superAdmin",
      "admin",
      "starUser",
      "goldUser",
      "platinumUser",
      "diamondUser",
      "employee",
      "telecaller",
    ],
    default: "employee",
  },

  // OTP
  otp: {
    type: Number,
  },

  otpValidity: {
    type: Date,
    default: Date.now,
  },

  otpVerified: {
    type: Boolean,
    default: false,
  },

  mobileVerified: {
    type: Boolean,
    default: false,
  },

  // ID Verification
  idType: {
    type: String,
    enum: ["pan", "aadhaar"],
  },

  // Account verification status
  verified: {
    type: Boolean,
    default: false,
  },

  aadhaarNo: {
    type: Number,
    minLength: [12, "Aadhaar no. must be of 12 digits"],
    maxLength: [12, "Aadhaar no. must be of 12 digits"],
    unique: true,
  },

  aadhaarVerified: {
    type: Boolean,
    default: false,
  },

  panNo: {
    type: String,
    minLength: [10, "PAN no. must be of 10 digits"],
    maxLength: [10, "PAN no. must be of 10 digits"],
    unique: true,
  },

  panVerified: {
    type: Boolean,
    default: false,
  },

  // Images
  images: [
    {
      docPath: {
        type: String,
        required: [true, "path required"],
      },
      docUrl: {
        type: String,
        required: [true, "URL required"],
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  resetPasswordToken: String,
  resetPasswordExpiry: Date,
});

employeeSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcryptjs.hash(this.password, 10);
    return next();
  }
  next();
});

// JWT TOKEN
employeeSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JET_SECRET, {
    expiresIn: process.env.JET_EXPIRE,
  });
};

// Generate password reset token
employeeSchema.methods.generatePasswordResetToken = function () {
  // Generating token
  const resetToken = crypto.randomBytes(20).toString("hax");
  // Hashing and add to employeeSchema
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

export default mongoose.model("Employee", employeeSchema);
