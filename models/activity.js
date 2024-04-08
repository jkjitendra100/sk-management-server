import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: [true, "User id required"],
  },

  title: {
    type: String,
    required: [true, "Title required"],
  },
  content: {
    type: String,
    required: [true, "Description required"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Activity", activitySchema);
