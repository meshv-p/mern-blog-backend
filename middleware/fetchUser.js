var jwt = require("jsonwebtoken");
const blog = require("../models/blog");
const jwtSecret = "Meshv#1341";

let currentUser = "";

const fetchUser = async (req, res, next) => {
  // fetch user from header to save in user.
  // console.log(1);
  // console.log(req.method);
  let token = req.header("Authorization");
  if (!token)
    return res.json({
      message: "Credential not proided...",
    });
  try {
    let data = jwt.verify(token, jwtSecret);
    // console.log(data);
    try {
      currentUser = data.id;
    } catch (error) {
      console.log("22", error);
    }
    req.user = data;
    next();
  } catch (error) {
    return res.json({
      error,
    });
  }
};

const checkBlogOwner = async (req, res, next) => {
  if (req.method == "DELETE" || req.method == "PATCH") {
    let _id = req.url.split("/")[2];
    // console.log("find owner", _id);
    try {
      let getBlog = await blog.findById(_id);
      // console.log("in middle", getBlog);
      // console.log(typeof getBlog.user, getBlog.user == currentUser);
      if (getBlog?.user == currentUser) {
        next();
        // console.log("owner");
      } else {
        return res.json({
          message: "Owner only have rights..",
        });
      }
    } catch (error) {
      return res.json({
        message: "Blog doesn't exists...",
      });
    }
  } else {
    next();
  }
};

module.exports = { fetchUser, checkBlogOwner };
