const { default: mongoose } = require("mongoose");
const { Notification } = require("../models/notification");

const makeNotification = async (req, res) => {
  let senderUser = req.user;
  let { body } = req;
  try {
    console.log(body);
    if (senderUser.id === body.to) {
      return res.send("done");
    }
    let makeNotification = await Notification.create({
      from: senderUser.id,
      to: body.to,
      text: body.text,
    });
    res.send(makeNotification);
  } catch (error) {
    res.send(error);
  }
};

const getNotificationByUser = async (req, res) => {
  let LoggedInUser = req.user;
  try {
    // console.log(LoggedInUser, "logg");
    // let allNotifications = await Notification.find({
    //   to: LoggedInUser.id,
    //   hasUserRead: false,
    // });

    let allNotifications = await Notification.aggregate([
      {
        $match: {
          to: new mongoose.Types.ObjectId(LoggedInUser.id),
          hasUserRead: false,
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "from",
          foreignField: "user",
          as: "from",
        },
      },
    ]);
    // console.log(allNotifications + "hey?");

    res.send(allNotifications);
  } catch (error) {
    console.log(error);
    res.status(404).send(error);
  }
};

const readNotification = async (req, res) => {
  let LoggedInUser = req.user;
  let { id } = req.body;
  try {
    console.log(LoggedInUser);
    let allNotifications = await Notification.findByIdAndUpdate(
      id,
      {
        hasUserRead: true,
      },
      {
        new: true,
      }
    );
    res.send(allNotifications);
  } catch (error) {
    res.send(error);
  }
};

module.exports = {
  makeNotification,
  getNotificationByUser,
  readNotification,
};
