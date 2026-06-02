const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.get("/", (req, res) => {
  res.send("Server Online");
});

io.on("connection", (socket) => {
  console.log("Player Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Player Disconnected:", socket.id);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log("Server Started");
});
