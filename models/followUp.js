import mongoose from "mongoose";

const assignedUserSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User id required"],
  },

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Employee Id required"],
  },

  title: {
    type: String,
    required: [true, "Title required"],
  },

  message: {
    type: String,
    required: [true, "Message required"],
  },

  status: {
    type: String,
    required: [true, "Status required"],
    enum: ["open", "closed"],
    default: "open",
  },

  nextFollowUpDate: {
    type: Number,
    required: [false, "Next follow up date required"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("assignedUser", assignedUserSchema);
