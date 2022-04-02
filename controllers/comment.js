const { default: mongoose } = require("mongoose");
const blog = require("../models/blog");
const comment = require("../models/comment");

const getComment = async (req, res) => {
  let { _id } = req.params;
  // console.log(page, "1");
  if (!_id)
    return res.json({
      message: "Please provide blog id...",
    });

  try {
    let findBlog = await blog.findById(_id);
    // let commentByBlog = await comment.find({ blog: findBlog._id });
    let commentByBlog = await comment.aggregate([
      {
        $match: {
          blog: new mongoose.Types.ObjectId(findBlog._id),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "user",
          foreignField: "user",
          as: "user",
        },
      },
    ]);

    // console.log(commentByBlog);

    res.json({ commentByBlog });
  } catch (error) {
    console.log(error);
  }
};

const getCommentByPagi = async (req, res) => {
  let { _id } = req.params;
  let { page, limit } = req.query;
  // console.log(page, limit);
  let Page = Number(page) || 1;
  let Limit = Number(limit) || 4;

  if (!_id)
    return res.json({
      message: "Please provide blog id...",
    });

  try {
    let findBlog = await blog.findById(_id);
    // let commentByBlog = await comment.find({ blog: findBlog._id });
    let commentByBlog = await comment.aggregate([
      {
        $match: {
          blog: new mongoose.Types.ObjectId(findBlog._id),
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "user",
          foreignField: "user",
          as: "user",
        },
      },
      {
        $skip: (Page - 1) * Limit,
      },
      {
        $limit: Limit,
      },
    ]);
    let length = await comment.countDocuments({
      blog: new mongoose.Types.ObjectId(findBlog._id),
    });
    // console.log(commentByBlog);

    res.json({ commentByBlog, length });
  } catch (error) {
    console.log(error);
  }
};

const createComment = async (req, res) => {
  let { _id } = req.params;
  let body = req.body;
  if (!_id)
    return res.json({
      message: "Please provide blog id...",
    });
  if (!body)
    return res.json({
      message: "Please provide comment...",
    });
  try {
    let newComment = await comment(body);
    if (!body?.blog) {
      try {
        newComment.blog = _id;
      } catch (error) {
        //get wrong blog id
        return res.json({
          message: "Something went wrong...",
        });
      }
    }
    if (!body?.user) {
      try {
        // console.log(req.user.id);
        newComment.user = req.user.id;
      } catch (error) {
        //get wrong user id
        return res.json({
          message: "Something went wrong...",
        });
      }
    }
    newComment.save();
    res.json({ newComment });
  } catch (error) {
    res.json({ error });
  }
};

// TODO:
/**
 * 1.replay to comment
 * 2. delete comment
 * 3. update comment
 */

module.exports = {
  getComment,
  getCommentByPagi,
  createComment,
};
