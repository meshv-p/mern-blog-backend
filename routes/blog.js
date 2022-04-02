const express = require("express");
const router = express.Router();

const {
  getAllBlogs,
  createblog,
  getOneBlog,
  deleteBlog,
  findBlog,
  updateBlog,
  getAllBlogsByPagi,
  makeLikeToBlog,
} = require("../controllers/blog");
const { fetchUser, checkBlogOwner } = require("../middleware/fetchUser");

router.route("/search/").get(findBlog);
// router.use([fetchUser]);
router.get("/blogs/", getAllBlogsByPagi);
router.get("/blogs", getAllBlogs);
router.post("/blogs", fetchUser, createblog);
router.route("/blog/:_id").get(getOneBlog);
router.patch("/blog/like/:_id", fetchUser, makeLikeToBlog);
router.use([fetchUser, checkBlogOwner]);
router.route("/blog/:_id").delete(deleteBlog).patch(updateBlog);

module.exports = router;
