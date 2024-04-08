import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User id required"],
  },

  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Employee Id required"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("followUp", followUpSchema);
