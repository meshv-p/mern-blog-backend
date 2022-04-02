let mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Please Provide Email"],
      // There are two ways for an promise-based async validator to fail:
      // 1) If the promise rejects, Mongoose assumes the validator failed with the given error.
      // 2) If the promise resolves to `false`, Mongoose assumes the validator failed and creates an error with the given `message`.
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

const ProfileSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true],
    },
    email: String,
    number: { type: Number, default: 0 },
    Profile_pic: { type: String, default: null },
    // posted_blogs: "Number",
    saved_blogs: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Post",
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

let User = mongoose.model("User", UserSchema);
let Profile = mongoose.model("Profile", ProfileSchema);

module.exports = {
  User,
  Profile,
};
