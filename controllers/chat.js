const Chat = require("../models/chat");
const { Profile } = require("../models/user");
const { default: mongoose } = require("mongoose");

const getAllChatByUserId = async (req, res) => {
  const { sender, receiver } = req.body;
  console.log(sender, receiver);
  let chats = await Chat.find({
    $or: [
      { sender, receiver },
      { sender: receiver, receiver: sender },
    ],
  });
  // console.log(chats);
  res.send(chats);
};

const saveChats = async (req, res) => {
  const { sender, receiver, message } = req;
  let chat = new Chat({
    sender,
    receiver,
    message,
  });
  let result = await chat.save();
  // res.send(result);
};

// get friendlist by followers
const getFriendListByFollowers = async (req, res) => {
  const { userId } = await req.body;
  console.log(userId, "id");
  let chats = await Profile.findOne({
    _id: userId,
  }).followers;
  //   .populate("followers");
  console.log(chats, "in 36");
  res.json(chats);
};

module.exports = { getAllChatByUserId, saveChats, getFriendListByFollowers };
