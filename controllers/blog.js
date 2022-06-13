const { default: mongoose } = require("mongoose");
const blog = require("../models/blog");
const { User, Profile } = require("../models/user");
// var jwt = require("jsonwebtoken");

const getAllBlogs = async (req, res) => {
  let q = req.params;
  console.log(q, "in 1");
  let page = 1;
  let limit = 4;
  try {
    let allBlogs = await blog.aggregate([
      {
        $lookup: {
          from: "profiles",
          localField: "user",
          foreignField: "user",
          as: "user",
        },
      },
      // {
      //   $skip: (page - 1) * limit,
      // },
      // {
      //   $limit: limit,
      // },
    ]);
    let length = await blog.countDocuments({});

    res.json({ allBlogs, length });
  } catch (error) {
    res.json({ error });
  }
};

const getAllBlogsByPagi = async (req, res) => {
  let { page, limit } = req.query;
  let Page = Number(page) || 1;
  let Limit = Number(limit) || 4;
  try {
    //For like
    // let findBlog = await blog.find({
    //   _id: "6245c8f199b2268d8bccc487",
    //   like: {
    //     $elemMatch: {
    //       $eq: "6245c68299b2268d8bccc47d",
    //     },
    //   },
    // });
    // let hasUserLiked = false;
    // if (findBlog.length !== 0) {
    //   hasUserLiked = true;
    // }
    // console.log(findBlog.length);

    let allBlogs = await blog.aggregate([
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
      // {
      //   $set: {
      //     hasUserLiked: hasUserLiked,
      //   },
      // },
    ]);
    allBlogs.hasUserLiked = false;

    let length = await blog.countDocuments({});

    res.json({ allBlogs, length });
  } catch (error) {
    console.log(error);
    res.json({ error });
  }
};

const createblog = async (req, res) => {
  try {
    let body = req.body;

    // Logged in user data from headers
    let data = req.user;
    console.log(body.tag);
    let newBlog = new blog({ ...body, user: data.id });
    await newBlog.save();

    try {
      let author = await User.findById({ _id: newBlog.user });
      author.posts.push(newBlog);
      await author.save();
    } catch (error) {
      // User doen't exists
      console.log("42", error);
      res.json({
        message: "Some error occured",
      });
    }
    return res.send({ newBlog });
    // return res.json({
    //   body: "got it" + body.tag,
    // });
  } catch (error) {
    console.log(error);
  }
};

const getOneBlog = async (req, res) => {
  /**
   * Find the blog by the id OR title OR tag
   */

  let { _id } = req.params;
  // console.log(typeof _id);
  try {
    try {
      let findBlog = await blog.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(_id),
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
      if (findBlog == null)
        return res.json({
          message: "Blog not found...",
        });
      res.json(findBlog[0]);
      // console.log(profile);
      // return res.json({ profile });
    } catch (error) {
      console.log("errror", error);
    }

    // let findBlog = await blog.findById(_id);
    // console.log(findBlog);
  } catch (error) {
    res.json({ error });
  }
};

const deleteBlog = async (req, res) => {
  let { _id } = req.params;
  try {
    let deleteBlog = await blog.findByIdAndDelete(_id);
    if (deleteBlog == null)
      return res.json({
        message: "Blog not found...",
      });
    // console.log(deleteBlog);
    res.json({ deleteBlog });
  } catch (error) {
    // res.json({ error });
    console.log(error);
  }
};

const findBlog = async (req, res) => {
  /**
   * Find the blog by title OR tag
   */
  let { title, tag, user } = req.query;
  // console.log(typeof title);
  try {
    // let result = await blog.aggregate([
    //   {
    //     $search: {
    //       index: "title",
    //       text: {
    //         query: title,
    //         path: {
    //           wildcard: "*",
    //         },
    //       },
    //     },
    //   },
    // ]);

    if (title) {
      console.log("The title :");

      let result = await blog.aggregate([
        {
          $match: {
            $or: [
              {
                title: {
                  $regex: new RegExp(title, "i"),
                },
              },
            ],
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

      // console.log(result);
      if (result.length == 0)
        return res.json({
          message: "No result found",
        });
      return res.json({ result });
    } else if (tag) {
      console.log("tag============");
      let result = await blog.aggregate([
        {
          $match: {
            tag: {
              $regex: new RegExp(tag, "i"),
            },
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
      // console.log(result);
      if (result.length === 0)
        return res.json({
          message: "No result found",
        });
      // console.log(result);
      return res.json({ result });
    }
    if (user) {
      // let result = await Profile.find({
      //   username: {
      //     $regex: new RegExp(user, "i"),
      //   },
      // }).populate("followers");
      console.log("user =============>");
      let result = await Profile.aggregate([
        {
          $match: {
            username: {
              $regex: new RegExp(user, "i"),
            },
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
      ]);

      // console.log(result);
      if (result.length == 0)
        return res.json({
          message: "No result found of user",
        });
      // console.log(result);
      return res.json({ result });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      message: "No result found",
    });
  }
};

const updateBlog = async (req, res) => {
  let body = req.body;
  let { _id } = req.params;
  console.log(_id);
  try {
    let b = await blog.findById(_id);
    console.log(b);
    let updatedBlog = await blog.findOneAndUpdate(_id, body, { new: true });
    // console.log(updatedBlog);

    res.json({ updatedBlog });
  } catch (error) {
    res.json({ error });
    console.log(error);
  }
};

const makeLikeToBlog = async (req, res) => {
  let { _id } = req.params;
  let user = req.user;
  // console.log(user);
  try {
    let findBlog = await blog.find({
      _id,
      like: {
        $elemMatch: {
          $eq: user.id,
        },
      },
    });
    let hasUserLiked = false;
    // console.log(findBlog.length);
    let newBlog = await blog.findById(_id);
    if (findBlog.length !== 0) {
      newBlog.like.pull(user.id);
      newBlog.totalLike -= 1;
      newBlog.save();
      // User liked
      hasUserLiked = true;
    } else {
      newBlog.like.push(user.id);
      newBlog.totalLike += 1;

      newBlog.save();
    }

    // let hasUserLiked = await blog.aggregate([
    //   {
    //     $match: { _id: _id },
    //   },
    //   {
    //     $addFields: {
    //       has: {
    //         $in: [mongoose.Types.ObjectId(user.id), findBlog.like],
    //       },
    //     },
    //   },
    // ]);

    res.json({ newBlog, hasUserLiked });
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

module.exports = {
  getAllBlogs,
  getAllBlogsByPagi,
  createblog,
  getOneBlog,
  deleteBlog,
  findBlog,
  updateBlog,
  makeLikeToBlog,
};
