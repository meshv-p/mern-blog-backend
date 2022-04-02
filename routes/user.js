const express = require("express");
const router = express.Router();

const {
  getAllUser,
  createUser,
  login,
  getOneUser,
  updateProfile,
  deleteProfile,
} = require("../controllers/user");

router.route("/").get(getAllUser).post(createUser);
router.route("/login").post(login);
router
  .route("/:_id")
  .get(getOneUser)
  .patch(updateProfile)
  .delete(deleteProfile);

module.exports = router;
