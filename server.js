const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000; // ✅ Render用に修正

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on("connection", (socket) => {
  let currentRoom = null;
  let userName = null;

  socket.on("joinRoom", ({ room, name }) => {
    if (!rooms[room]) {
      rooms[room] = {
        users: [],
        creator: name,
      };
    }

    if (rooms[room].users.includes(name)) {
      socket.emit("errorMessage", "この名前はすでに使われています。");
      return;
    }

    currentRoom = room;
    userName = name;
    rooms[room].users.push(name);
    socket.join(room);

    socket.emit("roomCreator", rooms[room].creator);
    io.to(currentRoom).emit("userList", rooms[room].users);
  });

  socket.on("chatMessage", (msg) => {
    if (currentRoom && userName) {
      io.to(currentRoom).emit("chatMessage", {
        name: userName,
        msg: msg,
      });
    }
  });

  socket.on("disconnect", () => {
    if (currentRoom && userName && rooms[currentRoom]) {
      rooms[currentRoom].users = rooms[currentRoom].users.filter(
        (user) => user !== userName
      );
      io.to(currentRoom).emit("userList", rooms[currentRoom].users);

      if (rooms[currentRoom].users.length === 0) {
        delete rooms[currentRoom];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
