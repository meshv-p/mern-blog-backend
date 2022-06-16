const { User, Profile } = require("../models/user");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
let { Schema } = require("mongoose");
const { default: mongoose } = require("mongoose");
const Token = require("../models/token");
const saltRounds = 10;
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const getAllUser = async (req, res) => {
  try {
    let allUser = await Profile.find({});
    res.json({ allUser });
  } catch (error) {
    res.json({ error });
  }
};

const getOneUser = async (req, res) => {
  let { _id } = req.params;
  try {
    // let oneUser = await Profile.findOne({ _id })
    let oneUser = await Profile.aggregate([
      {
        $match: {
          // _id,
          _id: mongoose.Types.ObjectId(_id),
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "followers",
          foreignField: "user",
          as: "followers",
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "following",
          foreignField: "_id",
          as: "following",
        },
      },
    ]);
    // .populate("followers")
    // .populate("following");
    res.json(oneUser[0]);
  } catch (error) {
    res.json({ error });
  }
};

const createUser = async (req, res) => {
  try {
    let { username, password, email, name } = req.body;

    if (!name)
      return res.status(403).json({
        msg: "Please Provide an Name...",
      });
    if (!email)
      return res.status(403).json({
        msg: "Please Provide an Email...",
      });

    if (!username)
      return res.status(403).json({
        msg: "Please Provide an Username...",
      });

    if (!password)
      return res.status(403).json({
        msg: "Please Provide an Password...",
      });

    let existsUser = await User.findOne({ username });
    if (existsUser)
      return res.status(400).json({
        msg: "User is already exists with this username.",
      });

    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        // Store hash in your password DB.
        if (err) console.log(err);

        let newUser = await User.create({
          username,
          password: hash,
          email,
          name,
        });

        await Profile.create({
          username,
          email,
          user: newUser._id,
          name,
        });

        // console.log(newUser);
        res.json({ username: newUser.username, email: newUser.email });
      });
    });

    // res.send("oee");
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  try {
    let { username, password } = req.body;

    let oldUser = await User.findOne({ username });
    if (!oldUser)
      return res.status(400).json({
        msg: "User doesn't exists",
      });
    console.log(oldUser);
    bcrypt.compare(password, oldUser.password, async function (err, result) {
      // result == true
      if (result) {
        let data = {
          id: oldUser._id,
          username,
        };
        let profile = await Profile.findOne({ user: oldUser._id });
        // console.log(profile);

        let authToken = jwt.sign(data, "Meshv#1341");

        res.json({ result, authToken, profile });
      } else {
        res.status(401).json({ msg: "Wrong credentials" });
      }
    });

    // res.send("oee");
  } catch (error) {
    console.log(error);
    res.status(401).send({
      msg: "User doesn't exists...",
    });
  }
};

const updateProfile = async (req, res) => {
  let { _id } = req.params;
  let body = req.body;
  try {
    console.log(_id, body);
    let newProfile = await Profile.findOneAndUpdate({ _id }, body, {
      new: true,
    });
    console.log(newProfile);
    res.json({ newProfile });
  } catch (error) {
    console.log(error);
  }
};

const deleteProfile = async (req, res) => {
  let { _id } = req.params;
  try {
    let deletedProfile = await Profile.findOneAndDelete(_id);
    // console.log(deletedProfile);
    if (deleteProfile == null) {
      return res.json({ deletedProfile });
    }
    res.json({ message: "User doesn't exists" });
  } catch (error) {
    console.log(error);
  }
};

const followUser = async (req, res) => {
  //Headers -- requesting user to _id account for follow
  //use follow (_id user) so add following in user
  // add (_id User) add follwers

  let { _id } = req.params; // another user founded
  let userId = req.user.id; //current loggedin user
  console.log(userId);
  try {
    // let anotherUserProfile = await Profile.findOne({ user: _id });

    // try {
    //   if (
    //     anotherUserProfile?.followers?.includes(Schema.Types.ObjectId(userId))
    //   ) {
    //     console.log("followers incre");
    //     anotherUserProfile?.followers?.push(userId);
    //   } else {
    //     console.log("followers dece");
    //     anotherUserProfile?.followers?.pull(Schema.Types.ObjectId(userId));
    //   }

    //   return res.json({ txt: "done" });
    // } catch (error) {
    //   console.log(error);
    // }

    let newProfile = await Profile.findOne({ _id });
    try {
      if (newProfile.followers?.includes(userId)) {
        console.log("follower dec of anotheruser");
        newProfile.followers?.pull(userId);
      } else {
        console.log("follower ince of anotheruser");
        newProfile.followers?.push(userId);
      }
      newProfile.save();
    } catch (error) {
      console.log(error, "error here 216");
      return res.json({ msg: "some error occured" + error, status: false });
    }

    let requestedUser = await Profile.findOne({ user: userId });
    console.log(requestedUser, "current user");
    if (requestedUser.following?.includes(_id)) {
      console.log("following dec of current");

      requestedUser.following?.pull(_id);
    } else {
      console.log("following ince of current");
      requestedUser.following?.push(_id);
    }
    requestedUser.save();

    // console.log(newProfile);
    res.json({ newProfile, requestedUser });
  } catch (error) {
    console.log(error, "error here");
  }
};

const sendPasswordReset = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user)
      return res
        .status(400)
        .json({ msg: "user with given email doesn't exist" });

    let token = await Token.findOne({ userId: user._id });
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }

    const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;

    const subject = "Reset password link";
    let text = `Hi, ${user.username}, Please reset your password`;
    let html = `Hi, ${user.username}, Please reset your password <br><p>You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n Please click on the following link, or paste this into your browser to complete the process:<br>
  <a href=${link}>Reset Password</a> <br> If you did not request this, please ignore this email and your password will remain unchanged.\n </p>`;
    await sendEmail(user.email, subject, text, html);

    return res.json({ msg: "password reset link sent to your email account" });
  } catch (error) {
    res.json({ err: "An error occured" });
    console.log(error);
  }
};

const passwordReset = async (req, res) => {
  console.log(req.params);
  let { token } = req.params;
  let { password: userNewPassword } = req.body;
  if (!token)
    return res.status(404).json({
      msg: "Token is not available.Please provide token",
    });
  try {
    let userToken = await Token.findOne({ token });
    // console.log(userToken);
    if (!userToken)
      return res.status(404).json({
        msg: "This token is not valid. Your token may have expired.",
      });

    // user email
    let user = await User.findOne({ _id: userToken.userId });

    bcrypt.genSalt(saltRounds, function (err, salt) {
      bcrypt.hash(userNewPassword, salt, async function (err, hash) {
        // Store hash in your password DB.
        if (err) console.log(err);
        await User.findOneAndUpdate(
          { _id: mongoose.Types.ObjectId(userToken.userId) },
          {
            password: hash,
          },
          {
            new: true,
          }
        );
        console.log(user.email);
        const subject = "Your password has been changed";
        let html = `<p>This is a confirmation that the password for your account ${user.email} has just been changed. </p>`;
        await sendEmail(user.email, subject, subject, html);

        return res
          .status(200)
          .json({ msg: "Password has been successfully changed." });
      });
    });
  } catch (error) {
    console.log(error);
    // return res.status(500).json({ err: "An unexpected error occurred" });
    return res.status(500).json({ err: error });
  }
};

module.exports = {
  getAllUser,
  createUser,
  login,
  getOneUser,
  updateProfile,
  deleteProfile,
  followUser,
  sendPasswordReset,
  passwordReset,
};
