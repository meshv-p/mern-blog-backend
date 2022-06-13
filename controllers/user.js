const { User, Profile } = require("../models/user");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");
let { Schema } = require("mongoose");
const { default: mongoose } = require("mongoose");
const saltRounds = 10;

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

module.exports = {
  getAllUser,
  createUser,
  login,
  getOneUser,
  updateProfile,
  deleteProfile,
  followUser,
};
