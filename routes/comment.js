const express = require("express");
const {
  getComment,
  createComment,
  getCommentByPagi,
} = require("../controllers/comment");
const { fetchUser } = require("../middleware/fetchUser");
const router = express.Router();
// router.use([fetchUser]);

router.route("/:_id/").get(getCommentByPagi);
router.route("/:_id").get(getComment);
router.post("/:_id", fetchUser, createComment);

module.exports = router;
