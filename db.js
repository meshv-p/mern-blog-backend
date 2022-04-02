const mongoose = require("mongoose");

// const connectionString =
//   "mongodb+srv://maan:maanpatel1823@clusters.amosb.mongodb.net/Task-manager?retryWrites=true&w=majority";

const connectToDB = (url) => {
  return mongoose
  .connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
};

module.exports = connectToDB

//   .then(() => {
//     console.log("mongodb connected");
//   })
//   .catch((err) => console.log(err));
