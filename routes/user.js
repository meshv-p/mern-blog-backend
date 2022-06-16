const express = require("express");
const router = express.Router();

const {
  getAllUser,
  createUser,
  login,
  getOneUser,
  updateProfile,
  deleteProfile,
  followUser,
  sendPasswordReset,
  passwordReset,
} = require("../controllers/user");
const { fetchUser } = require("../middleware/fetchUser");

router.route("/").get(getAllUser).post(createUser);
router.route("/login").post(login);
router.patch("/friends/:_id", fetchUser, followUser);
router.post("/password-reset/:token", passwordReset);
router.post("/password/reset", sendPasswordReset);
router
  .route("/:_id")
  .get(getOneUser)
  .patch(updateProfile)
  .delete(deleteProfile);

module.exports = router;
