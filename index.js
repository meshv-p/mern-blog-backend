let express = require("express");
const connectToDB = require("./db");
let router = require("./routes/blog");
let user = require("./routes/user");
const cors = require("cors");
let comment = require("./routes/comment");
let notifications = require("./routes/notifications");
const Image = require("./models/Image");
const multer = require("multer");
let app = express();
let fs = require("fs");
const path = require("path");
var cloudinary = require("cloudinary").v2;

// middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running perfectly.");
});

// Step 7 - the GET request handler that provides the HTML UI
var upload = multer({ storage: storage });
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

cloudinary.config({
  cloud_name: "sample",
  api_key: "797823269864347",
  api_secret: "a676b67565c6767a6767d6767f676fe1",
  secure: true,
});

// app.get("api/v1/search", findBlog);
app.use("/api/v1/comment/", comment);
app.use("/api/v1/notification/", notifications);
app.use("/api/v1/users/", user);
app.use("/api/v1/", router);
let port = 5000;
// let url =
//   "mongodb+srv://maan:maanpatel1823@clusters.amosb.mongodb.net/Relations?retryWrites=true&w=majority";

let url =
  "mongodb://localhost:27017/MERN_BLOG?readPreference=primary&appname=MongoDB%20Compass&ssl=false";

const start = async () => {
  try {
    await connectToDB(url);
    app.listen(port, () => {
      console.log(
        `Server is running at port ${port}...http://localhost:${port}`
      );
    });
  } catch (e) {
    console.log(e);
  }
};

start();
