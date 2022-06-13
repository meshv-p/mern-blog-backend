let mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Types.ObjectId,
      ref: "Profile",
    },
    to: {
      type: mongoose.Types.ObjectId,
      ref: "Profile",
    },
    text: String,
    hasUserRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

let Notification = mongoose.model("Notification", NotificationSchema);

module.exports = { Notification };
