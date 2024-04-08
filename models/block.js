import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "User id required"],
  },

  blockTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "Block to required"],
  },

  // reason: {
  //   type: String,
  //   required: [true, "Reason required"],
  // },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("blockedProfile", blogSchema);
