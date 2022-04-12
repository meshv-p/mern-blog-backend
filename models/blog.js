let mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Must Provide title of blog"],
    },
    desc: {
      type: String,
      required: [true, "Must Provide desc of blog"],
    },
    tag: [String],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pic: String,
    like: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
        // unique: true,
      },
    ],
    totalLike: { type: Number, default: 0 },
    hasUserLiked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", BlogSchema);
