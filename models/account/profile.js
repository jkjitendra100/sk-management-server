import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "Please enter name"],
    minLength: [2, "First name should be at least 2 characters long"],
  },

  lastName: {
    type: String,
    required: [false, "Please enter name"],
  },

  dob: {
    type: Number,
    required: [true, "Date of birth is required"],
  },

  birthTime: {
    hour: {
      type: Number,
      required: [false, "Time of birth (hour) is required"],
    },

    minute: {
      type: Number,
      required: [false, "Time of birth (minute) is required"],
    },
  },

  birthPlace: {
    type: String,
  },
  
  birthState: {
    type: String,
  },
  
  birthCity: {
    type: String,
  },

  height: {
    type: Number,
    required: [true, "Height required"],
  },

  manglikStatus: {
    type: String,
  },

  horoscopeMatch: {
    type: String,
  },

  about: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID required"],
  },
});

export default mongoose.model("Profile", profileSchema);
