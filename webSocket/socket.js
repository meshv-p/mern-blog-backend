let http = require("http");
let socket = require("socket.io");
const { saveChats } = require("../controllers/chat");

const startSocket = () => {
  let users = {};
  let onlineUser = [];
  const httpServer = http.createServer();
  const io = new socket.Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // console.log(socket.handshake.query.id);
    socket.userId = socket.handshake.query.id;
    socket.username = socket.handshake.query.name;
    // console.log("middleware", socket.userId);
    next();
  });

  io.on("connection", (socket) => {
    users[socket.userId] = socket.id;
    //set online user array with connected field true
    onlineUser.push({
      id: socket.userId,
      name: socket.username,
      connected: true,
    });

    console.log("New user connected", socket.id, socket.userId);
    //broadcast to all users
    io.emit("online", onlineUser);

    console.log(users, "30");
    for (let index in users) {
      console.log(index, users[index], users[index].connected);
    }
    //send online users to all users
    socket.on("connect", () => {
      socket.broadcast.emit("online", {
        users: Object.keys(users),
        onlineUser: onlineUser,
      });
    });
    socket.broadcast.emit("online", {
      users: Object.keys(users),
      onlineUser: onlineUser,
    });

    //send offline user status
    socket.on("disconnect", (data) => {
      //remove user from online user array
      onlineUser = onlineUser.filter((user) => user.id !== socket.userId);

      // users[socket.userId] = false;

      console.log("offline", socket.id, data);
      //find user _id according to socket id
      let userId = Object.keys(users).find((key) => users[key] === socket.id);
      socket.broadcast.emit("offline", userId);
    }),
      socket.on("hey", (data) => {
        // console.log(data);
        // socket.emit("hey", data);
        // find the user and send the message to that user
        io.to(users[data.to]).emit("hey", data);
        // socket.to(data.to).emit("hey", data);
      });

    //send message emit to private chat
    socket.on("send-msg", (data) => {
      // console.log(users);
      /**
       *    {
       *      'sender':id,
       *      msg:text,
       *     to:id,
       *      'time':time,
       *    }
       */

      // console.log(data);
      saveChats(
        { sender: data.sender, receiver: data.to, message: data.message },
        ""
      );
      io.to(users[data.to]).emit("receive-msg", { ...data, fromMe: false });
    });
  });

  io.listen(5001);
};

module.exports = startSocket;
