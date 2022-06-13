const express = require("express");
const {
  makeNotification,
  getNotificationByUser,
  readNotification,
} = require("../controllers/notification");
const router = express.Router();
const { fetchUser } = require("../middleware/fetchUser");
router.use(fetchUser);
router
  .route("/")
  .post(makeNotification)
  .get(getNotificationByUser)
  .patch(readNotification);

module.exports = router;
