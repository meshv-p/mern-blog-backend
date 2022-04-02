const mongoose = require("mongoose");
let Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    title: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: "Blog",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", CommentSchema);
