const { User, Profile } = require("../models/user");
const bcrypt = require("bcrypt");
var jwt = require("jsonwebtoken");

const saltRounds = 10;

const getAllUser = async (req, res) => {
  try {
    let allUser = await User.find({});
    res.json({ allUser });
  } catch (error) {
    res.json({ error });
  }
};

const getOneUser = async (req, res) => {
  let { _id } = req.params;
  try {
    let oneUser = await Profile.findOne({ user: _id });
    res.json({ oneUser });
  } catch (error) {
    res.json({ error });
  }
};

const createUser = async (req, res) => {
  try {
    let { username, password, email, name } = req.body;

    if (!email)
      return res.json({
        err: "Please Provide an Email...",
      });

    let existsUser = await User.findOne({ username });
    if (existsUser)
      return res.status(400).json({
        message: "User is already exists with this username.",
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
    // console.log(oldUser);
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
      message: "User doesn't exists...",
    });
  }
};

const updateProfile = async (req, res) => {
  let { _id } = req.params;
  let body = req.body;
  try {
    let newProfile = await Profile.findOneAndUpdate(_id, body, {
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

module.exports = {
  getAllUser,
  createUser,
  login,
  getOneUser,
  updateProfile,
  deleteProfile,
};
