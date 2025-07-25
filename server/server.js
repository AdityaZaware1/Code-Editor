const express = require("express");
const app = express();
require("dotenv").config();
const http = require("http");
const cors = require("cors");
const ACTIONS = require("./utils/actions");

app.use(express.json());
app.use(cors());

const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let userSocketMap = [];

function getUsersInRoom(roomId) {
  return userSocketMap.filter((user) => user.roomId == roomId);
}

function getRoomId(socketId) {
  const user = userSocketMap.find((user) => user.socketId === socketId);
  return user?.roomId;
}

io.on("connection", (socket) => {
  socket.on(ACTIONS.JOIN_REQUEST, ({ roomId, username }) => {
    const isUsernameExist = getUsersInRoom(roomId).filter(
      (u) => u.username === username
    );
    if (isUsernameExist.length > 0) {
      io.to(socket.id).emit(ACTIONS.USERNAME_EXISTS);
      return;
    }

    const user = {
      username,
      roomId,
      status: ACTIONS.USER_ONLINE,
      cursorPosition: 0,
      typing: false,
      socketId: socket.id,
      currentFile: null,
    };
    userSocketMap.push(user);
    socket.join(roomId);
    socket.broadcast.to(roomId).emit(ACTIONS.USER_JOINED, { user });
    const users = getUsersInRoom(roomId);
    io.to(socket.id).emit(ACTIONS.JOIN_ACCEPTED, { user, users });
  });

  socket.on("disconnecting", () => {
    const user = userSocketMap.find((user) => user.socketId === socket.id);
    const roomId = user?.roomId;
    if (roomId === undefined || user === undefined) return;
    socket.broadcast.to(roomId).emit(ACTIONS.USER_DISCONNECTED, { user });
    userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
    socket.leave();
  });

  // File actions
  socket.on(ACTIONS.SYNC_FILES, ({ files, currentFile, socketId }) => {
    io.to(socketId).emit(ACTIONS.SYNC_FILES, { files, currentFile });
  });
  socket.on(ACTIONS.FILE_CREATED, ({ file }) => {
    const roomId = getRoomId(socket.id);
    socket.broadcast.to(roomId).emit(ACTIONS.FILE_CREATED, { file });
  });
  socket.on(ACTIONS.FILE_UPDATED, ({ file }) => {
    const roomId = getRoomId(socket.id);
    socket.broadcast.to(roomId).emit(ACTIONS.FILE_UPDATED, { file });
  });
  socket.on(ACTIONS.FILE_RENAMED, ({ file }) => {
    const roomId = getRoomId(socket.id);
    socket.broadcast.to(roomId).emit(ACTIONS.FILE_RENAMED, { file });
  });
  socket.on(ACTIONS.FILE_DELETED, ({ id }) => {
    const roomId = getRoomId(socket.id);
    socket.broadcast.to(roomId).emit(ACTIONS.FILE_DELETED, { id });
  });

  // User status
  socket.on(ACTIONS.USER_OFFLINE, ({ socketId }) => {
    userSocketMap = userSocketMap.map((user) =>
      user.socketId === socketId ? { ...user, status: ACTIONS.USER_OFFLINE } : user
    );
    const roomId = getRoomId(socketId);
    socket.broadcast.to(roomId).emit(ACTIONS.USER_OFFLINE, { socketId });
  });

  socket.on(ACTIONS.USER_ONLINE, ({ socketId }) => {
    userSocketMap = userSocketMap.map((user) =>
      user.socketId === socketId ? { ...user, status: ACTIONS.USER_ONLINE } : user
    );
    const roomId = getRoomId(socketId);
    socket.broadcast.to(roomId).emit(ACTIONS.USER_ONLINE, { socketId });
  });

  // Chat
  socket.on(ACTIONS.SEND_MESSAGE, ({ message }) => {
    const roomId = getRoomId(socket.id);
    socket.broadcast.to(roomId).emit(ACTIONS.RECEIVE_MESSAGE, { message });
  });

  // Typing indicators
  socket.on(ACTIONS.TYPING_START, ({ cursorPosition }) => {
    userSocketMap = userSocketMap.map((user) =>
      user.socketId === socket.id ? { ...user, typing: true, cursorPosition } : user
    );
    const user = userSocketMap.find((user) => user.socketId === socket.id);
    socket.broadcast.to(user.roomId).emit(ACTIONS.TYPING_START, { user });
  });

  socket.on(ACTIONS.TYPING_PAUSE, () => {
    userSocketMap = userSocketMap.map((user) =>
      user.socketId === socket.id ? { ...user, typing: false } : user
    );
    const user = userSocketMap.find((user) => user.socketId === socket.id);
    socket.broadcast.to(user.roomId).emit(ACTIONS.TYPING_PAUSE, { user });
  });

  // WebRTC signaling
  socket.on(ACTIONS.VIDEO_OFFER, ({ to, offer }) => {
    io.to(to).emit(ACTIONS.VIDEO_OFFER, { from: socket.id, offer });
  });

  socket.on(ACTIONS.VIDEO_ANSWER, ({ to, answer }) => {
    io.to(to).emit(ACTIONS.VIDEO_ANSWER, { from: socket.id, answer });
  });

  socket.on(ACTIONS.ICE_CANDIDATE, ({ to, candidate }) => {
    io.to(to).emit(ACTIONS.ICE_CANDIDATE, { from: socket.id, candidate });
  });
});

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API is running successfully");
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
