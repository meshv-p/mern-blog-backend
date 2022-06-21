let mongoose = require("mongoose");

let ChatSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, "Must Provide message of chat"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    hasUserRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", ChatSchema);
