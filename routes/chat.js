const express = require("express");
const {
  getAllChatByUserId,
  getFriendListByFollowers,
} = require("../controllers/chat");
const router = express.Router();

router.post("/", getAllChatByUserId);
router.post("/friendlist", getFriendListByFollowers);

module.exports = router;
